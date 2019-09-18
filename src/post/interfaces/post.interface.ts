import { Types, Document } from 'mongoose';

export interface Post extends Document {
  title: string;
  text: string;
  group: Types.ObjectId;
  author: Types.ObjectId;
  likedBy: Types.ObjectId[];
  dislikedBy: Types.ObjectId[];
  replyTo: Types.ObjectId;
}
