import { UserRole } from '../../user/enums/user-roles.enum';

export interface JwtPayload {
  id: string;
  username: string;
  roles: UserRole[];
  exp?: number;
  iat?: number;
}
