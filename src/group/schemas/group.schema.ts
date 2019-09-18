import { Schema, SchemaTypes } from 'mongoose';
import {
  GroupUserRole,
  DEFAULT_GROUP_USER_ROLE,
} from '../../user/enums/group-user-role.enum';

export const RegisteredUserSchema = new Schema(
  {
    user: {
      type: SchemaTypes.ObjectId,
      unique: true,
      index: true,
      ref: 'User',
    },
    role: {
      type: String,
      enum: [
        GroupUserRole.CREATOR,
        GroupUserRole.MODERATOR,
        GroupUserRole.MEMBER,
      ],
      default: DEFAULT_GROUP_USER_ROLE,
    },
  },
  { _id: false },
);
export const GroupRuleSchema = new Schema(
  {
    subject: { type: String },
    description: { type: String },
  },
  { _id: false },
);

export const GroupSchema = new Schema(
  {
    name: { type: String, unique: true },
    description: { type: String },
    users: {
      type: [RegisteredUserSchema],
    },
    tags: { type: [String] },
    rules: { type: [GroupRuleSchema] },
  },
  { timestamps: true },
);
