import { Schema, SchemaTypes } from 'mongoose';

export const PostSchema = new Schema(
  {
    title: String,
    subtitle: String,
    text: String,
    social: { type: SchemaTypes.ObjectId, ref: 'Social', index: true },
    isPrivate: { type: Boolean, index: true },
    likedBy: { type: [{ type: SchemaTypes.ObjectId, ref: 'User' }], default: [] },
    dislikedBy: { type: [{ type: SchemaTypes.ObjectId, ref: 'User' }], default: [] },
    reaction: { type: Number, default: 0 },
    author: { type: SchemaTypes.ObjectId, ref: 'User' },
    replyTo: { type: SchemaTypes.ObjectId, ref: 'Post', index: true },
    views: { type: Number, default: 0 },
    comment: { type: Number, default: 0 },
    flairs: { type: [{ type: String, index: true }] },
  },
  { timestamps: true },
);
