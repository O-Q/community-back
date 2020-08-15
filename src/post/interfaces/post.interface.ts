import { Types, Document } from 'mongoose';
import { Post } from '@nestjs/common';
import { SocialType } from '../../user/interfaces/user.interface';

export interface IPost {
  title: string;
  subtitle: string;
  text: string;
  flairs: string[];
  social: Types.ObjectId;
  comments: Types.ObjectId[] | Post[];
  comment: number;
  isPrivate?: boolean;
  socialType: SocialType;
  author: Types.ObjectId;
  likedBy: Types.ObjectId[];
  dislikedBy: Types.ObjectId[];
  replyTo: Types.ObjectId;
}

export interface Post extends IPost, Document {

}
