import { Types, Document } from 'mongoose';
import { GroupUserRole } from '../../user/enums/group-user-role.enum';

export interface Group extends Document {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly users: RegisteredUser[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface RegisteredUser {
  readonly user: Types.ObjectId;
  readonly role?: GroupUserRole[];
}
