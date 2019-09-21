import { SetMetadata } from '@nestjs/common';
import { GroupUserRole } from '../../user/enums/group-user-role.enum';

export const GroupRoles = (...roles: GroupUserRole[]) =>
  SetMetadata('groupRoles', roles);
