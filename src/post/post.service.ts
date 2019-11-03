import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './interfaces/post.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { DBErrorHandler } from '../utils/error-handlers/db.handler';
import { CreateReplyPostDto } from './dto/reply-post.dto';
import { User, SocialType } from '../user/interfaces/user.interface';
import { EditPostDto } from './dto/edit-post.dto';
import { SocialUserRole } from '../user/enums/social-user-role.enum';
import { hasPermissionToAction } from '../utils/functions/role.func';
import { SocialPostQuery } from './dto/social-post.query.dto';
import { calcSkippedPage } from '../utils/functions/skip-page.func';
import { PostSortBy } from './enums/sort-post.enum';
import moment = require('moment');
import { PostParams } from './dto/post-params.dto';
import { SocialUserStatus } from '../user/enums/social-user-status.enum';

@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private readonly postModel: Model<Post>) { }

  /**
   *
   * @param socialId the ID of the social
   * @param queryParams only contains `itemsPerPage` and `page`. sortBy is optional.
   * default sortBy is `NEWEST`.
   */
  async getPostsBySocialId(socialId: string, queryParams: SocialPostQuery) {
    const skipped = calcSkippedPage(queryParams.itemsPerPage, queryParams.page);
    const sortBy = queryParams.sortBy;
    const notRepliedPost = { replayTo: { $exists: false } };
    const isSocial = { social: Types.ObjectId(socialId) };
    const baseQuery = this.postModel
      .aggregate()
      .match(isSocial)
      .match(notRepliedPost)
      .skip(skipped)
      .limit(queryParams.itemsPerPage);
    return await this._sortPosts(baseQuery, sortBy);
  }

  async getSearchedPostsBySocialId(
    socialId: string,
    queryParams: SocialPostQuery,
  ) {
    // TODO: sort and skip
    return await this.postModel
      .find({ group: Types.ObjectId(socialId) })
      .regex('text subject', new RegExp(queryParams.text, 'i'));
  }
  /**
   * Create new post
   */
  async createPostByGroupId(
    createPostDto: CreatePostDto,
    groupId: string,
    user: User,
  ): Promise<Post> {
    if (
      this.isGroupUserStatusActive(user, groupId) &&
      this.isUserAccessWrite(user, groupId)
    ) {
      const post: Post = await this.postModel
        .create({
          ...createPostDto,
          group: Types.ObjectId(groupId),
          author: user._id,
        } as Post)
        .catch(DBErrorHandler);
      return post;
    }
  }

  /**
   * Create reply post
   */
  async createReplayPostByGroupId(
    createReplyPostDto: CreateReplyPostDto,
    groupId: string,
    user: User,
  ): Promise<Post> {
    if (this.isGroupUserStatusActive(user, groupId)) {
      const { text, replyTo } = createReplyPostDto;
      const post: Post = await this.postModel
        .create({
          text,
          replyTo: Types.ObjectId(replyTo),
          group: Types.ObjectId(groupId),
          author: user._id,
        } as Post)
        .catch(DBErrorHandler);
      return post;
    }
  }

  /**
   * Delete post if user is `author`
   * or user's group role is `GroupUserRole.CREATOR`
   * or user is `GroupUserRole.MODERATOR` and `author` is `GroupUserRole.USER`.
   */
  async deletePostById(postId: string, user: User) {
    const post = await this.postModel
      .findById(postId)
      .populate('author', 'author group');
    if (this.isGroupUserStatusActive(user, post.group.toHexString())) {
      const author = (post.author as unknown) as User;

      // TODO: maybe author was not in the group anymore.
      if (hasPermissionToAction(user, author, post.group)) {
        const deletedPost: Post = await post.remove().catch(DBErrorHandler);
        console.log(deletedPost);
        // delete all replayed post
        return await this.postModel.deleteMany({ replyTo: postId });
      }
    }
  }

  // TODO: REQUEST to edit post by everybody
  async editPostById(
    editPostDto: EditPostDto,
    postId: string,
    user: User,
  ): Promise<Post> {
    return await this.postModel
      .findByIdAndUpdate(postId, { ...editPostDto } as Post)
      .where('author')
      .equals(user.id)
      .catch(DBErrorHandler);
  }

  async getPostById(postParams: PostParams): Promise<Post> {
    const { pid, sid } = postParams;
    const INCREASE_VIEWS = { $inc: 'views' };
    return await this.postModel
      .findByIdAndUpdate(pid, INCREASE_VIEWS)
      .where('group', sid); // 'where' in this case is for safety
  }
  async _sortPosts(baseQuery, sortBy: PostSortBy): Promise<Post[]> {
    if (!sortBy || sortBy === PostSortBy.NEWEST) {
      // sort by date
      return baseQuery.sort({ createdAt: -1 }).exec();
    } else {
      const startDate = moment()
        .startOf('day')
        .subtract(7, 'days');
      const endDate = moment().endOf('day');
      const inSevenDays = { createdAt: { $gte: startDate, $lte: endDate } };

      if (sortBy === PostSortBy.HOT) {
        // sort by views
        return baseQuery
          .match(inSevenDays)
          .sort({ views: 'desc' })
          .exec();
      } else if (sortBy === PostSortBy.TOP) {
        // sort by liked count
        const likedByCountField = {
          likedByCount: { $size: { $ifNull: ['$likedBy', []] } },
        };

        return baseQuery
          .match(inSevenDays)
          .addFields(likedByCountField)
          .sort({ likedByCount: 'desc' })
          .exec();
      }
    }
  }

  /**
   * Check whether user in this group is active. otherwise throw `Forbidden Exception`
   */
  private isGroupUserStatusActive(user: User, socialId: string): boolean {
    const userStatus = user.socials.find(
      s => s.social.toHexString() === socialId,
    ).status;
    if (userStatus === SocialUserStatus.ACTIVE) {
      return true;
    } else {
      throw new ForbiddenException('user status in this group is not ACTIVE.');
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
      throw new ForbiddenException("user doesn't have permission to write");
    }
  }
}
