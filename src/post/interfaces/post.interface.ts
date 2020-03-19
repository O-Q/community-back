import { Types, Document } from 'mongoose';

export interface Post extends Document {
  title: string;
  subtitle: string;
  text: string;
  social: Types.ObjectId;
  author: Types.ObjectId;
  likedBy: Types.ObjectId[];
  dislikedBy: Types.ObjectId[];
  replyTo: Types.ObjectId;
}
