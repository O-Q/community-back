import { UserRole } from '../enums/user-roles.enum';
import {
  GroupUserRole,
  DEFAULT_GROUP_USER_ROLE,
} from '../enums/group-user-role.enum';
import { Schema, SchemaTypes } from 'mongoose';
import {
  GroupUserStatus,
  DEFAULT_GROUP_USER_STATUS,
} from '../enums/group-user-status.enum';
import { UserStatus } from '../enums/user-status.enum';

// TODO
const RegisteredGroupSchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        GroupUserStatus.ACTIVE,
        GroupUserStatus.BANNED,
        GroupUserStatus.PENDING,
      ],
      default: DEFAULT_GROUP_USER_STATUS,
    },
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
    status: {
      type: String,
      enum: [
        UserStatus.ACTIVE,
        UserStatus.BANNED,
        UserStatus.CONFIRM_PENDING,
        UserStatus.DELETED,
      ],
    },
  },
  { timestamps: true, versionKey: false },
);
