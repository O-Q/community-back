import { Schema, SchemaTypes, Types } from 'mongoose';
import {
  SocialUserRole,
  DEFAULT_SOCIAL_USER_ROLE,
} from '../../user/enums/social-user-role.enum';
import { SocialStatus } from '../enums/social-status.enum';
import { SocialType } from '../../user/interfaces/user.interface';
import { messages } from '../../utils/constants/messages.const';

export const DEFAULT_PERMISSION_ROLES = {
  newPost: true,
  comment: true,
  changeAvatar: true,
  changeBanner: true,
  changeInfo: true,
  changeWidgets: true,
  changeUsers: false,
};

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
    registeredToShow: { type: Boolean, default: false },
    viewValue: { type: String },
  },
  { _id: false },
);

export const ColorsSchema = new Schema(
  {
    background: { type: String },
    primary: { type: String },
    accent: { type: String },
    text: { type: String },
    title: { type: String },
  },
  { _id: false },
);

export const PermissionRolesSchema = new Schema(
  {
    newPost: { type: Boolean },
    comment: { type: Boolean },
    changeAvatar: { type: Boolean },
    changeBanner: { type: Boolean },
    changeInfo: { type: Boolean },
    changeWidgets: { type: Boolean },
    changeUsers: { type: Boolean }
  },
  { _id: false },
);

const TAGS_LIMIT = 5;
const FLAIRS_LIMIT = 20;
export const SocialSchema = new Schema(
  {
    name: { type: String, unique: true, index: true },
    avatar: { type: String },
    banner: { type: String },
    title: { type: String },
    activityScore: { type: Number, default: 0 },
    colors: { type: ColorsSchema },
    description: { type: String },
    aboutMe: { type: String },
    permissionRoles: {
      type: PermissionRolesSchema, default: DEFAULT_PERMISSION_ROLES,
    },
    users: {
      type: [RegisteredUserSchema],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
      // max array length is 5
      validate: [arrayLimit, `{PATH} ${messages.db.LIMIT_EXCEEDED} ${TAGS_LIMIT}`],

    },
    flairs: {
      type: [String],
      index: true,
      default: [],
      // max array length is 20
      validate: [arrayLimit, `{PATH} ${messages.db.LIMIT_EXCEEDED} ${FLAIRS_LIMIT}`],
    },
    type: { type: String, enum: [SocialType.BLOG, SocialType.FORUM], required: true, index: true },
    rules: { type: [SocialRuleSchema] },
    isPrivate: { type: Boolean, default: false },
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
