import { UserRole } from '../enums/user-roles.enum';
import { Document, Types } from 'mongoose';
import { SocialUserRole } from '../enums/social-user-role.enum';
import { SocialUserStatus } from '../enums/social-user-status.enum';
import { UserStatus } from '../enums/user-status.enum';

export interface User extends Document {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly phone: number;
  readonly description: string;
  readonly socials: RegisteredSocial[];
  readonly roles: UserRole[];
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface RegisteredSocial {
  readonly writeAccess?: boolean;
  readonly status?: SocialUserStatus;
  readonly social: Types.ObjectId;
  readonly socialType: SocialType;
  readonly role?: SocialUserRole;
  readonly name: string;
}

export enum SocialType {
  FORUM = 'FORUM',
  BLOG = 'BLOG',
}
