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

// TODO
const RegisteredGroupSchema = new Schema(
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
    name: { type: String },
    social: {
      type: SchemaTypes.ObjectId,
      unique: true,
      sparse: true,
      index: true,
      ref: 'Social',
    },
    socialType: {
      type: String,
      enum: [SocialType.BLOG, SocialType.FORUM],
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
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // todo: nullable unique
    phone: { type: Number, unique: true, sparse: true },
    description: { type: String },
    socials: { type: [RegisteredGroupSchema] },
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
