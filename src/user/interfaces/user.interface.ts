import { UserRole } from '../enums/user-roles.enum';
import { Document, Types } from 'mongoose';
import { GroupUserRole } from '../enums/group-user-role.enum';
import { GroupUserStatus } from '../enums/group-user-status.enum';
import { UserStatus } from '../enums/user-status.enum';

export interface User extends Document {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly phone: number;
  readonly description: string;
  readonly groups: RegisteredGroup[];
  readonly roles: UserRole[];
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface RegisteredGroup {
  readonly status?: GroupUserStatus;
  readonly group: Types.ObjectId;
  readonly role?: GroupUserRole;
}
