import { SetMetadata } from '@nestjs/common';

/**
 * use for restriction access
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
