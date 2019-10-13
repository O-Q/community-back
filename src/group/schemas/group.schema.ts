import { Schema, SchemaTypes } from 'mongoose';
import {
  GroupUserRole,
  DEFAULT_GROUP_USER_ROLE,
} from '../../user/enums/group-user-role.enum';
import { GroupStatus } from '../enums/group-status.enum';

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

const TAGS_LIMIT = 5;
export const GroupSchema = new Schema(
  {
    name: { type: String, unique: true, index: true },
    description: { type: String },
    users: {
      type: [RegisteredUserSchema],
    },
    tags: {
      type: [String],
      // max array length is 5
      validate: [arrayLimit, `{PATH} exceeds the limit of ${TAGS_LIMIT}`],
      index: true,
    },
    rules: { type: [GroupRuleSchema] },
    private: { type: Boolean, default: false },
    // TODO
    tree: { type: SchemaTypes.Map },
    status: {
      type: String,
      enum: [GroupStatus.ACTIVE, GroupStatus.INACTIVE],
      default: GroupStatus.ACTIVE,
    },
  },
  { timestamps: true },
);

function arrayLimit(val: string[]) {
  return val.length <= TAGS_LIMIT;
}
