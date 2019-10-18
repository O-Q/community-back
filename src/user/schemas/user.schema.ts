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
      sparse: true,
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
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // todo: nullable unique
    phone: { type: Number, unique: true, sparse: true },
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
