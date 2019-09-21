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

/**
 *
 */
@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private readonly postModel: Model<Post>) {}

  async getPostsByGroupId(groupId: string) {
    return await this.postModel.find({ group: Types.ObjectId(groupId) });
  }

  async getFilteredPostsByGroupId(
    groupId: string,
    queryParams: GroupPostQuery,
  ) {
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
    const post: Post = await this.postModel
      .create({
        ...createPostDto,
        group: Types.ObjectId(groupId),
        author: user._id,
      } as Post)
      .catch(DBErrorHandler);
    return post;
  }

  /**
   * Create reply post
   */
  async createReplayPostByGroupId(
    createReplyPostDto: CreateReplyPostDto,
    groupId: string,
    user: User,
  ): Promise<Post> {
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

  /**
   * Delete post if user is `author`
   * or user's group role is `GroupUserRole.CREATOR`
   * or user is `GroupUserRole.MODERATOR` and `author` is `GroupUserRole.USER`.
   */
  async deletePostById(postId: string, user: User) {
    const post = await this.postModel
      .findById(postId)
      .populate('author', 'author group');

    const author = (post.author as unknown) as User;

    // TODO: maybe author was not in the group anymore.
    if (hasPermissionToAction(user, author, post.group)) {
      const deletedPost: Post = await post.remove().catch(DBErrorHandler);
      console.log(deletedPost);
      // delete all replayed post
      return await this.postModel.deleteMany({ replyTo: postId });
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
}
