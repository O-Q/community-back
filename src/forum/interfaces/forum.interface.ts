import { Types, Document } from 'mongoose';
import { SocialUserRole } from '../../user/enums/social-user-role.enum';
import { RuleSocial } from '../../social/dto/rule-social.dto';

export interface Forum extends Document {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly users: RegisteredUser[];
  readonly tags: string[];
  readonly flairs: string[];
  readonly rules: RuleSocial[];
  readonly posts: Types.ObjectId[];
  readonly private: boolean;
  readonly tree: any; // TODO
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface RegisteredUser {
  readonly user: Types.ObjectId;
  readonly role?: SocialUserRole[];
}
