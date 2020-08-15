import { UserRole } from '../enums/user-roles.enum';
import {
  SocialUserRole,
  DEFAULT_SOCIAL_USER_ROLE,
} from '../enums/social-user-role.enum';
import { Schema, SchemaTypes } from 'mongoose';
import {
  SocialUserStatus,
  DEFAULT_SOCIAL_USER_STATUS,
} from '../enums/social-user-status.enum';
import { UserStatus } from '../enums/user-status.enum';
import { SocialType } from '../interfaces/user.interface';

const NotificationSchema = new Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  pid: { type: SchemaTypes.ObjectId },
  sid: { type: SchemaTypes.ObjectId },

},
  { timestamps: true, versionKey: false, _id: false });

const RegisteredSocialSchema = new Schema(
  {
    writeAccess: { type: Boolean, default: true },
    status: {
      type: String,
      enum: [
        SocialUserStatus.ACTIVE,
        SocialUserStatus.BANNED,
        SocialUserStatus.PENDING,
      ],
      default: DEFAULT_SOCIAL_USER_STATUS,
    },
    notifications: { type: [NotificationSchema], default: [] },
    social: {
      type: SchemaTypes.ObjectId,
      // unique: true,
      // sparse: true,
      // index: true,
      ref: 'Social',
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


export const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // todo: nullable unique
    phone: { type: Number, unique: true, sparse: true },
    description: { type: String },
    socials: { type: [RegisteredSocialSchema] },
    avatar: { type: String }, // address
    banner: { type: String }, // address
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
    privacy: { type: Object },
    following: { type: [{ type: SchemaTypes.ObjectId, ref: 'User' }], default: [] },
    followersCount: { type: Number, default: 0 },
  },

  { timestamps: true, versionKey: false },
);

// import {
//   Entity,
//   ObjectID,
//   ObjectIdColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
// } from 'typeorm';

// @Entity()
// export class User {
//   @ObjectIdColumn()
//   id: ObjectID;

//   @Column({ unique: true, nullable: false })
//   username: string;

//   @Column()
//   email: string;

//   @Column({ nullable: false })
//   password: string;

//   @Column({ unique: true, nullable: false })
//   phone: number;

//   @Column()
//   description: string;

//   //todo
//   @Column()
//   groups: any;

//   @Column({ enum: UserRole, array: true })
//   roles: UserRole[];

//   @Column({ enum: UserStatus })
//   status: UserStatus;

//   @CreateDateColumn({ type: 'timestamp' })
//   createdAt: Date;

//   @UpdateDateColumn({ type: 'timestamp', nullable: true })
//   updatedAt: Date;
// }
