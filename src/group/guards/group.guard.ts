import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../../user/interfaces/user.interface';
import { Types } from 'mongoose';
import { Reflector } from '@nestjs/core';
import { GroupUserRole } from '../../user/enums/group-user-role.enum';

/**
 * check whether user is in the group and role meets `@GroupRoles` decorator. \
 * `NOTE`: retrieve group `gid` in params and doesn't check author for post. \
 * `default`: check whether user is in group.
 */
@Injectable()
export class GroupGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const gid = request.params.gid;

    const expectedRoles =
      this.reflector.get<GroupUserRole[]>('groupRoles', context.getHandler()) ||
      this.reflector.get<GroupUserRole[]>('groupRoles', context.getClass());
    if (Types.ObjectId.isValid(gid)) {
      const user: User = request.user;
      const groupId = Types.ObjectId(request.params.id);
      const group = user.groups.find(rg => rg.group === groupId);

      if (expectedRoles) {
        const isUserPermitted =
          group !== undefined && expectedRoles.includes(group.role);
        return isUserPermitted;
      } else {
        const isUserInGroup = group !== undefined;
        return isUserInGroup;
      }
    }
  }
}
