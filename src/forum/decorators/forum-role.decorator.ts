import { SetMetadata } from '@nestjs/common';
import { SocialUserRole } from '../../user/enums/social-user-role.enum';

export const ForumRoles = (...roles: SocialUserRole[]) =>
  SetMetadata('forumRoles', roles);
