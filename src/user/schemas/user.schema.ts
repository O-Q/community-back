import { UserRole } from '../enums/user-roles.enum';
import {
  GroupUserRole,
  DEFAULT_GROUP_USER_ROLE,
} from '../enums/group-user-role.enum';
import { Schema, SchemaTypes } from 'mongoose';

// TODO
const RegisteredGroupSchema = new Schema(
  {
    group: {
      type: SchemaTypes.ObjectId,
      unique: true,
      index: true,
      ref: 'Group',
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

export const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String, required: true },
    phone: { type: Number, required: true, unique: true },
    description: { type: String },
    groups: { type: [RegisteredGroupSchema] },
    roles: {
      type: [String],
      enum: [UserRole.ADMIN, UserRole.USER],
    },
  },
  { timestamps: true, versionKey: false },
);
