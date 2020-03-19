import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../../user/interfaces/user.interface';
import { Types } from 'mongoose';
import { Reflector } from '@nestjs/core';
import { SocialUserRole } from '../../user/enums/social-user-role.enum';

/**
 * check whether user is in the social(forum or blog) and role meets `@ForumRoles` decorator. \
 * `NOTE`: retrieve social `sid` in params and doesn't check author for post. \
 * `default`: check whether user is in forum.
 */
@Injectable()
export class SocialGuard implements CanActivate {
  constructor(private reflector: Reflector) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const sid = request.params.sid;

    const expectedRoles =
      this.reflector.get<SocialUserRole[]>(
        'forumRoles',
        context.getHandler(),
      ) ||
      this.reflector.get<SocialUserRole[]>('forumRoles', context.getClass());

    if (Types.ObjectId.isValid(sid)) {
      const user: User = request.user;
      const social = user.socials.find(rs => rs.social.toHexString() === sid);
      if (expectedRoles) {
        const isUserPermitted =
          social !== undefined && expectedRoles.includes(social.role);
        return isUserPermitted;
      } else {
        const isUserInGroup = social !== undefined;
        return isUserInGroup;
      }
    }
  }
}
