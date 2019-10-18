import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './interfaces/post.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { DBErrorHandler } from '../utils/error-handlers/db.handler';
import { CreateReplyPostDto } from './dto/reply-post.dto';
import { User } from '../user/interfaces/user.interface';
import { EditPostDto } from './dto/edit-post.dto';
import { GroupUserRole } from '../user/enums/group-user-role.enum';
import { hasPermissionToAction } from '../utils/functions/role.func';
import { GroupPostQuery } from './dto/group-post.query.dto';
import { calcSkippedPage } from '../utils/functions/skip-page.func';
import { PostSortBy } from './enums/sort-post.enum';
import moment = require('moment');
import { PostParams } from './dto/post-params.dto';
import { GroupUserStatus } from '../user/enums/group-user-status.enum';

/**
 *
 */
@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private readonly postModel: Model<Post>) {}

  /**
   *
   * @param groupId the ID of the group
   * @param queryParams only contains `itemsPerPage` and `page`. sortBy is optional.
   * default sortBy is `NEWEST`.
   */
  async getPostsByGroupId(groupId: string, queryParams: GroupPostQuery) {
    const skipped = calcSkippedPage(queryParams.itemsPerPage, queryParams.page);
    const sortBy = queryParams.sortBy;
    const notRepliedPost = { replayTo: { $exists: false } };
    const isGroup = { group: Types.ObjectId(groupId) };
    const baseQuery = this.postModel
      .aggregate()
      .match(isGroup)
      .match(notRepliedPost)
      .skip(skipped)
      .limit(queryParams.itemsPerPage);
    return await this._sortPosts(baseQuery, sortBy);
  }

  async getSearchedPostsByGroupId(
    groupId: string,
    queryParams: GroupPostQuery,
  ) {
    // TODO: sort and skip
    return await this.postModel
      .find({ group: Types.ObjectId(groupId) })
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
    if (this.isGroupUserStatusActive(user, groupId)) {
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
    const { pid, gid } = postParams;
    const INCREASE_VIEWS = { $inc: 'views' };
    return await this.postModel
      .findByIdAndUpdate(pid, INCREASE_VIEWS)
      .where('group', gid); // 'where' in this case is for safety
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
  private isGroupUserStatusActive(user: User, groupId: string): boolean {
    const userStatus = user.groups.find(g => g.group.toHexString() === groupId)
      .status;
    if (userStatus === GroupUserStatus.ACTIVE) {
      return true;
    } else {
      throw new ForbiddenException('user status in this group is not ACTIVE.');
    }
  }
}
