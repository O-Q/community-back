import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './interfaces/post.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { DBErrorHandler } from '../utils/error-handlers/db.handler';
import { CreateReplyPostDto } from './dto/reply-post.dto';
import { User } from '../user/interfaces/user.interface';
import { EditPostDto } from './dto/edit-post.dto';

@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private readonly postModel: Model<Post>) {}

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

  async deletePostById(postId: string, user: User) {
    const deletedPost: Post = await this.postModel
      .findByIdAndDelete(postId)
      .where('author')
      .equals(user.id)
      .lean()
      .catch(DBErrorHandler);
    console.log(deletedPost);
    return await this.postModel.deleteMany({ replyTo: postId });
  }

  async editPostById(editPostDto: EditPostDto, postId: string, user: User) {
    this.postModel
      .findByIdAndUpdate(postId, { ...editPostDto } as Post)
      .where('author')
      .equals(user.id);
  }
}
