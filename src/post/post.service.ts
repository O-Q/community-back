import { Injectable, ForbiddenException, NotFoundException, Type, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, IPost } from './interfaces/post.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { DBErrorHandler } from '../utils/error-handlers/db.handler';
import { CreateReplyPostDto } from './dto/reply-post.dto';
import { User, SocialType } from '../user/interfaces/user.interface';
import { EditPostDto } from './dto/edit-post.dto';
import { hasPermissionToAction } from '../utils/functions/role.func';
import { SocialPostQuery } from './dto/social-post.query.dto';
import { calcSkippedPage } from '../utils/functions/skip-page.func';
import { PostSortBy } from './enums/sort-post.enum';
import moment = require('moment');
import * as fs from 'fs';
import { PostParams, ReplyPostParams } from './dto/post-params.dto';
import { SocialUserStatus } from '../user/enums/social-user-status.enum';
import { Forum } from '../forum/interfaces/forum.interface';
import { UserPostsQuery } from './dto/get-user-posts-query.dto';
import { messages } from '../utils/constants/messages.const';
import clip from 'text-clipper';
import { POST_JOIN_SOCIAL, POST_JOIN_AUTHOR } from '../shared/common-query';
import { Blog } from '../blog/interfaces/blog.interface';
import { ActivityScore } from '../utils/constants/activity-score.constant';
import { File } from 'fastify-multer/lib/interfaces';
import { isImageFile, getFileFormat } from '../utils/functions/image.func';
import { STATIC_FILE_PATH_FRONT, STATIC_FILE_PATH_BACK } from '../config/static-file-path.config';
import { v4 as uuid } from 'uuid';
import { NotificationType } from '../user/enums/notification.enum';
@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('Social') private readonly socialModel: Model<Forum | Blog>,
    @InjectModel('User') private readonly userModel: Model<User>
  ) { }

  /**
   *
   * @param socialName the ID of the social
   * @param queryParams only contains `itemsPerPage` and `page`. sortBy is optional.
   * default sortBy is `NEWEST`.
   */
  async getPostsBySocialName(queryParams: SocialPostQuery, user: User) {
    const flairsNotReplied = this._combineFlairsReplayTo(queryParams.flair);
    const isSocialPost = { $match: { social: queryParams.n } };
    const skipItems = { $skip: calcSkippedPage(+queryParams.itemsPerPage, +queryParams.page) };
    const limitItems = { $limit: +queryParams.itemsPerPage };

    const sortPosts = this._sortPosts(queryParams.sortBy);
    const removeJunks = { $project: { __v: 0 } };

    const posts = await this.postModel
      .aggregate([flairsNotReplied,
        ...POST_JOIN_SOCIAL,
        isSocialPost,
        ...sortPosts,
        skipItems,
        limitItems,
        ...POST_JOIN_AUTHOR,
        removeJunks,
      ]);
    const matchLength = {
      social: posts[0]?.sid,
      replyTo: { $exists: false },
      flairs: queryParams.flair,
    };
    if (!matchLength.flairs) {
      delete matchLength.flairs;
    }
    let length = (await this.postModel.aggregate().match(matchLength).count('length'))[0];
    posts.forEach((p: any) => {
      const liked = p.likedBy.find((id: Types.ObjectId) => id.toHexString() === user?.id) ? true : null ||
        p.dislikedBy.find((id: Types.ObjectId) => id.toHexString() === user?.id) ? false : null;
      p.liked = liked;
      delete p.likedBy;
      delete p.dislikedBy;
      p.text = clip(p.text, 300, { html: true, breakWords: true, maxLines: 5 });
    });
    setImmediate(() => {
      this.postModel.updateMany({ _id: { $in: posts.map(p => p._id) } }, { $inc: { views: 1 } }, { timestamps: false });
    });
    if (!length) {
      length = { length: 0 };
    }

    return { posts, ...length };
  }
  private _combineFlairsReplayTo(flairs) {
    if (flairs) {
      return {
        $match: {
          flairs,
          replyTo: { $exists: false },
        },
      };
    } else {
      return {
        $match: {
          replyTo: { $exists: false },
        },
      };
    }
  }

  // TODO
  async getSearchedPostsBySocialName(
    queryParams: SocialPostQuery,
  ) {
    // TODO: sort and skip
    // return await this.postModel
    // .find({ social: Types.ObjectId(socialId) })
    // .regex('text subject', new RegExp(queryParams.text, 'i'));
  }
  /**
   * Create new post
   */
  async createPostBySocialId(
    createPostDto: CreatePostDto,
    socialId: string,
    user: User,
  ): Promise<Post> {
    if (
      this.isSocialUserStatusActive(user, socialId) &&
      this.isUserAccessWrite(user, socialId)
    ) {
      const social = await this.socialModel.findById(socialId, { users: 1, isPrivate: 1 });
      const post: Post = await this.postModel
        .create({
          ...createPostDto,
          social: Types.ObjectId(socialId),
          author: user._id,
          isPrivate: social.isPrivate,
        } as Post)
        .catch(DBErrorHandler);
      setImmediate(async () => {
        await social.updateOne({ $push: { posts: post.id }, $inc: { activityScore: ActivityScore.NEW_POST } });
        await this.userModel.updateMany({ _id: { $in: social.users.map(u => user.id !== u.user.toHexString() ? u.user : null) } },
          {
            $push:
            {
              'socials.$[element].notifications': {
                type: NotificationType.NEW_POST,
                message: `پست جدیدی توسط ${user.username} ایجاد شد.`,
                pid: post.id,
              },
            },
          },
          { arrayFilters: [{ 'element.social': social._id }] });
      });

      return post;
    }
  }

  /**
   * Create reply post
   */
  async createReplyPostBySocialName(
    createReplyPostDto: CreateReplyPostDto,
    replyPostParams: ReplyPostParams,
    user: User,
  )
    : Promise<Post> {
    const { comment, socialType } = createReplyPostDto;
    const { pid, sid } = replyPostParams;
    if (socialType === SocialType.BLOG || this.isSocialUserStatusActive(user, sid)) {
      const post: Post = await this.postModel
        .create({
          text: comment,
          replyTo: Types.ObjectId(pid),
          social: Types.ObjectId(sid),
          author: user._id,
          socialType,
        } as Post)
        .catch(DBErrorHandler);
      const jpost = post.toJSON();
      jpost.author = user.username;

      setImmediate(async () => {
        const mainPostAuthor = (await this.postModel.findById(pid).lean()).author;
        await this.userModel.updateOne(
          { _id: mainPostAuthor },
          { $push: { 'socials.$[element].notifications': { type: NotificationType.REPLY, message: `${user.username} به پست شما پاسخ داده است.`, pid } } },
          { arrayFilters: [{ 'element.social': sid }] }).lean();
        await this.postModel.findByIdAndUpdate(pid, { $inc: { comment: 1 } }, { timestamps: false });
      });
      return jpost;
    }
  }

  /**
   * Delete post if user is `author`
   * or user's group role is `GroupUserRole.CREATOR`
   * or user is `GroupUserRole.MODERATOR` and `author` is `GroupUserRole.USER`.
   */
  async deletePostById(postId: string, user: User, socialType: SocialType) {
    const post = await this.postModel
      .findById(postId)
      .populate({ path: 'author', select: 'socials' });

    if (socialType === SocialType.BLOG || this.isSocialUserStatusActive(user, post.social.toHexString())) {
      const author = (post.author as unknown) as User;

      // TODO: maybe author was not in the group anymore.
      if (hasPermissionToAction(user, author, post.social)) {
        if (post.replyTo) {
          await this.postModel.findByIdAndUpdate(post.replyTo, { $inc: { comment: -1 } }, { timestamps: false });
        }
        const deletedPost: Post = await post.remove().catch(DBErrorHandler);
        // delete all replayed post
        setImmediate(async () => {
          await this.postModel.deleteMany({ replyTo: postId });
          await this.socialModel.findByIdAndUpdate(
            post.social,
            { $pull: { posts: post._id }, $inc: { activityScore: ActivityScore.DELETE_POST } });
        });
        return { message: 'deleted' };
      }
    }
  }

  async uploadImage(sname: string, file: File) {
    if (isImageFile(file)) {
      const type = getFileFormat(file);
      const name = `${sname}-${uuid()}`;
      const address = `${STATIC_FILE_PATH_FRONT}/post/${name}.${type}`;
      const sAddress = `${STATIC_FILE_PATH_BACK}/post/${name}.${type}`;
      fs.writeFileSync(sAddress, file.buffer);
      return { url: address };
    } else {
      throw new BadRequestException(`فرمت تصویر ${messages.common.INVALID}`);
    }
  }

  async reactToPostById(user: User, pid: string, reaction: 'LIKE' | 'DISLIKE') {
    const post = await this.postModel.findById(pid);
    let r = 0;
    let inc = 0;
    const diffReaction = post.likedBy.length - post.dislikedBy.length;
    const isLikedBefore = post.likedBy.find((id: Types.ObjectId) => id.toHexString() === user.id);
    const isDislikedBefore = post.dislikedBy.find((id: Types.ObjectId) => id.toHexString() === user.id);
    let activityScoreFactor: number;
    if (reaction === 'LIKE') {
      if (isLikedBefore) { // remove like (negative activity)
        activityScoreFactor = -1;
        inc -= 1;
        await post.updateOne({ $pull: { likedBy: user._id }, $inc: { reaction: inc } }, { timestamps: false });
      } else {
        activityScoreFactor = 1;
        inc += 1;
        if (isDislikedBefore) {
          inc += 1;
        }
        await post.updateOne({ $pull: { dislikedBy: user._id }, $addToSet: { likedBy: user._id }, $inc: { reaction: inc } }, { timestamps: false });

      }
      r = diffReaction + inc;
    } else { // DISLIKE
      if (isDislikedBefore) { // remove dislike
        activityScoreFactor = -1;
        inc += 1;
        await post.updateOne({ $pull: { dislikedBy: user._id }, $inc: { reaction: inc } }, { timestamps: false });
      } else { // add dislike
        activityScoreFactor = 1;
        inc -= 1;
        if (isLikedBefore) {
          inc -= 1;
        }
        await post.updateOne({ $pull: { likedBy: user._id }, $addToSet: { dislikedBy: user._id }, $inc: { reaction: inc } }, { timestamps: false });
      }
      r = diffReaction + inc;
    }
    setImmediate(async () => {
      if ([-1, 1].includes(inc)) { // new express or remove only
        await this.socialModel.findByIdAndUpdate(post.social, { $inc: { activityScore: ActivityScore.EXPRESS_POST * activityScoreFactor } });
      }
      if (inc === 2 || (inc === 1 && !isDislikedBefore)) {
        const message = `${user.username} پست شما را پسندید.`;
        await this.userModel.updateOne(
          { _id: post.author },
          { $push: { 'socials.$[element].notifications': { type: NotificationType.REACTION, message, pid: post.id } } },
          { arrayFilters: [{ 'element.social': post.social }] },
        );
      } else if (inc === -2 || (inc === -1 && !isLikedBefore)) {
        const message = `${user.username} پست شما را نپسندید.`;
        await this.userModel.updateOne(
          { _id: post.author },
          { $push: { 'socials.$[element].notifications': { type: NotificationType.REACTION, message, pid: post.id } } },
          { arrayFilters: [{ 'element.social': post.social }] },
        );
      }
    });
    return { reaction: r };
  }

  // TODO: REQUEST to edit post by everybody
  async editPostById(
    editPostDto: EditPostDto,
    postId: string,
    user: User,
  ): Promise<Post> {
    let timestamps = true;
    if (editPostDto.title === '$$COMMENT') { // TODO: BEAtiFY SOMEHOW
      delete editPostDto.title;
      timestamps = false;
    }
    const post = await this.postModel
      .findByIdAndUpdate(postId, { ...editPostDto }, { timestamps })
      .where('author')
      .equals(user.id)
      .catch(DBErrorHandler);
    post.text = editPostDto.text;
    post.title = editPostDto.title;
    post.flairs = editPostDto.flairs;
    return post;
  }

  async getUserPosts(userPostsQuery: UserPostsQuery, user: User) {
    const { u, itemsPerPage, page, isComment, sortBy } = userPostsQuery;
    const skipItems = { $skip: calcSkippedPage(+ itemsPerPage, +page) };
    const limitItems = { $limit: +itemsPerPage };
    const sortByQuery = userPostsQuery.sortBy;
    const isUser = { author: u };
    const removeJunks = { $project: { __v: 0 } };
    // if (userPostsQuery.isComment) {

    // }
    const notRepliedPost = { replyTo: { $exists: false } };
    const posts: IPost[] = await this.postModel.aggregate(
      [
        { $match: notRepliedPost },
        ...POST_JOIN_AUTHOR,
        { $match: isUser },
        skipItems, limitItems,
        ...POST_JOIN_SOCIAL,
        removeJunks,
      ],
    );
    posts.forEach((p: IPost) => {
      if (user) {
        const liked = (p.likedBy.find((id: Types.ObjectId) => id.toHexString() === user.id) ? true : null) ||
          (p.dislikedBy.find((id: Types.ObjectId) => id.toHexString() === user.id) ? false : null);
        p['liked'] = liked;
      } else {
        p['liked'] = null;
      }
      delete p.likedBy;
      delete p.dislikedBy;
    });

    setImmediate(() => {
      this.postModel.updateMany({ _id: { $in: posts.map(p => p['_id']) } }, { $inc: { views: 1 } }, { timestamps: false });
    });
    return posts.reverse();
  }

  async getPostById(postParams: PostParams, user: User): Promise<Post> {
    const { pid } = postParams;
    const INCREASE_VIEWS = { $inc: { views: 1 } };
    const result = await this.postModel
      .findByIdAndUpdate(pid, INCREASE_VIEWS, { timestamps: false })
      .populate('social', { name: 1, type: 1 }).select({ __v: 0 })
      .populate('author', { username: 1, _id: 0 }).lean() as any;
    if (result) {
      const liked = result.likedBy.find((id: Types.ObjectId) => id.toHexString() === user?.id) ? true : null ||
        result.dislikedBy.find((id: Types.ObjectId) => id.toHexString() === user?.id) ? false : null;

      result.liked = liked;
      // result.social.admins = result.social.users.filter(x => [SocialUserRole.CREATOR, SocialUserRole.MODERATOR].includes(x.role));
      // delete result.social;
      result.author = result.author.username;
      result.comments = await this.postModel.find({ replyTo: pid }, { __v: 0 })
        .populate('author', { username: 1, _id: 0 })
        .lean();
      result.comments.map(c => {
        c.author = c.author.username;
        c.liked = c.likedBy.find((id: Types.ObjectId) => id.toHexString() === user?.id) ? true : null ||
          c.dislikedBy.find((id: Types.ObjectId) => id.toHexString() === user?.id) ? false : null;
        delete c.likedBy;
        delete c.dislikedBy;
      });
      return result;
    } else {
      throw new NotFoundException();
    }
  }
  _sortPosts(sortBy: PostSortBy) {
    if (!sortBy || sortBy === PostSortBy.NEWEST) {
      // sort by date
      return [{ $sort: { createdAt: -1 } }];
    } else {
      const startDate = moment()
        .startOf('day')
        .subtract(7, 'days');
      const endDate = moment().endOf('day');
      const inSevenDays = { createdAt: { $gte: startDate, $lte: endDate } };

      if (sortBy === PostSortBy.HOT) {
        // sort by views
        return [
          { $match: inSevenDays },
          { $addFields: { rating: { $sum: ['$views', { $multiply: ['$reaction', 2] }] } } },
          { $sort: { rating: -1 } },
        ];
      } else if (sortBy === PostSortBy.TOP) {
        // sort by liked count
        const likedByCountField = {
          likedByCount: { $size: { $ifNull: ['$likedBy', []] } },
        };
        return [
          { $match: inSevenDays },
          { $addFields: likedByCountField },
          { $sort: { likedByCount: -1 } },
        ];
      }
    }
  }

  /**
   * Check whether user in this group is active. otherwise throw `Forbidden Exception`
   */
  private isSocialUserStatusActive(user: User, socialId: string): boolean {
    const userStatus = user.socials.find(
      s => s.social.toHexString() === socialId,
    )?.status;
    if (userStatus === SocialUserStatus.ACTIVE) {
      return true;
    } else {
      throw new ForbiddenException(messages.post.NOT_ACTIVE_IN_SOCIAL);
    }
  }

  /**
   * Check whether user has access to write in this group. otherwise throw `Forbidden Exception`
   */
  private isUserAccessWrite(user: User, socialId: string) {
    // TODO: social type?
    const writeAccess = user.socials.find(
      s => s.social.toHexString() === socialId,
    ).writeAccess;
    if (writeAccess) {
      return true;
    } else {
      throw new ForbiddenException(messages.post.NOT_PERMITTED_TO_WRITE);
    }
  }
}
