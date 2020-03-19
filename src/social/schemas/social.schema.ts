import { Schema, SchemaTypes } from 'mongoose';
import {
  SocialUserRole,
  DEFAULT_SOCIAL_USER_ROLE,
} from '../../user/enums/social-user-role.enum';
import { SocialStatus } from '../enums/social-status.enum';
import { SocialType } from '../../user/interfaces/user.interface';

export const RegisteredUserSchema = new Schema(
  {
    user: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: [
        SocialUserRole.CREATOR,
        SocialUserRole.MODERATOR,
        SocialUserRole.MEMBER,
      ],
      default: DEFAULT_SOCIAL_USER_ROLE,
    },
  },
  { _id: false },
);
export const SocialRuleSchema = new Schema(
  {
    subject: { type: String },
    description: { type: String },
  },
  { _id: false },
);

export const WidgetSchema = new Schema(
  {
    name: { type: String },
    inputs: { type: Object },
  },
  { _id: false },
);

const TAGS_LIMIT = 5;
const FLAIRS_LIMIT = 20;
export const SocialSchema = new Schema(
  {
    name: { type: String, unique: true, index: true },
    description: { type: String },
    users: {
      type: [RegisteredUserSchema],
    },
    tags: {
      type: [{ type: String, index: true, unique: true }],
      default: [],

      // max array length is 5
      validate: [arrayLimit, `{PATH} exceeds the limit of ${TAGS_LIMIT}`],

    },
    flairs: {
      type: [{ type: String, index: true, unique: true }],
      default: [],
      // max array length is 20
      validate: [arrayLimit, `{PATH} exceeds the limit of ${FLAIRS_LIMIT}`],
    },
    type: { type: String, enum: [SocialType.BLOG, SocialType.FORUM], required: true, index: true },
    rules: { type: [SocialRuleSchema] },
    private: { type: Boolean, default: false },
    posts: { type: [{ type: SchemaTypes.ObjectId, ref: 'Post', index: true }], default: [] },
    status: {
      type: String,
      enum: [SocialStatus.ACTIVE, SocialStatus.INACTIVE],
      default: SocialStatus.ACTIVE,
    },
    widgets: {
      type: [WidgetSchema], // default must be rules of overall site
    },
  },
  { timestamps: true },
);

function arrayLimit(val: string[]) {
  return val.length <= TAGS_LIMIT;
}
