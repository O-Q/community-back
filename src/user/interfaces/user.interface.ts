import { UserRole } from '../enums/user-roles.enum';
import { Document, Types } from 'mongoose';
import { GroupUserRole } from '../enums/group-user-role.enum';

export interface User extends Document {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly phone: number;
  readonly description: string;
  readonly groups: RegisteredGroup[];
  readonly roles: UserRole[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface RegisteredGroup {
  readonly group: Types.ObjectId;
  readonly role?: GroupUserRole;
}
