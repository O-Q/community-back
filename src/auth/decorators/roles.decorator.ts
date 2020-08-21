import { SetMetadata } from '@nestjs/common';
import { PermissionRoles } from '../../forum/interfaces/forum.interface';
import { Permission } from '../../social/enums/permission-role.enum';
import { SocialUserRole } from '../../user/enums/social-user-role.enum';

/**
 * use for restriction access
 */
export const Roles = (...roles: SocialUserRole[]) => SetMetadata('roles', roles);

export const Permissions = (...permissionRoles: Permission[]) => SetMetadata('permissionRoles', permissionRoles);
