import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../../user/interfaces/user.interface';
import { Types, Model } from 'mongoose';
import { Reflector } from '@nestjs/core';
import { SocialUserRole } from '../../user/enums/social-user-role.enum';
import { Forum } from '../interfaces/forum.interface';
import { InjectModel } from '@nestjs/mongoose';

/**
 * check whether user is in the social(forum or blog) and role meets `@ForumRoles` decorator. \
 * `NOTE`: retrieve social `sid` in params and doesn't check author for post. \
 * `default`: check whether user is in forum.
 */
@Injectable()
export class SocialGuard implements CanActivate {
  constructor(private reflector: Reflector,
    @InjectModel('Social') private readonly forumModel: Model<Forum>,
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sname = request.query.n;
    const sid = request.params.sid;

    const expectedRoles =
      this.reflector.get<SocialUserRole[]>(
        'roles',
        context.getHandler(),
      )?.[0] ||
      this.reflector.get<SocialUserRole[]>('roles', context.getClass())?.[0];

    const user = request.user;

    if (sid) {
      const userSocial = user.socials.find(rs => rs.social.toHexString() === sid);
      return this._isUserLegalToAction(userSocial, expectedRoles);
    } else if (sname) {
      // TODO: select only what you need
      const social = await this.forumModel.findOne({ name: sname });
      const userSocial = user.socials.find(rs => rs.social.toHexString() === social.id);
      request.social = social;
      return this._isUserLegalToAction(userSocial, expectedRoles);
    }
  }

  private _isUserLegalToAction(userSocial, expectedRoles) {

    if (expectedRoles) {
      const isUserPermitted = expectedRoles.includes(userSocial?.role);
      return isUserPermitted;
    } else {
      const isUserInGroup = userSocial !== undefined;
      return isUserInGroup;
    }
  }
}
