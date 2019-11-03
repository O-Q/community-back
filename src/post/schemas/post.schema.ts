import { Schema, SchemaTypes } from 'mongoose';

export const PostSchema = new Schema(
  {
    title: String,
    text: String,
    social: { type: SchemaTypes.ObjectId, ref: 'Social', index: true },
    likedBy: { type: [SchemaTypes.ObjectId], ref: 'User' },
    dislikedBy: { type: [SchemaTypes.ObjectId], ref: 'User' },
    author: { type: SchemaTypes.ObjectId, ref: 'User' },
    replyTo: { type: SchemaTypes.ObjectId, ref: 'Post', index: true },
    views: { type: Number, default: 0 },
    flairs: { type: [String], index: true },
  },
  { timestamps: true },
);
