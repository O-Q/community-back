import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User, SocialType } from '../../user/interfaces/user.interface';
import { Types, Model } from 'mongoose';
import { Reflector } from '@nestjs/core';
import { SocialUserRole } from '../../user/enums/social-user-role.enum';
import { Forum, PermissionRoles } from '../interfaces/forum.interface';
import { InjectModel } from '@nestjs/mongoose';
import { DEFAULT_PERMISSION_ROLES } from '../../social/schemas/social.schema';

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
    const socialType = request.body?.socialType;
    const expectedPermissionRoles =
      this.reflector.get<SocialType[]>(
        'permissionRoles',
        context.getHandler(),
      ) ||
      this.reflector.get<SocialType[]>('permissionRoles', context.getClass());



    const mustAffectSocialType =
      this.reflector.get<SocialType[]>(
        'socialType',
        context.getHandler(),
      )?.[0] ||
      this.reflector.get<SocialType[]>('socialType', context.getClass())?.[0];

    const expectedRoles =
      this.reflector.get<SocialUserRole[]>(
        'roles',
        context.getHandler(),
      ) ||
      this.reflector.get<SocialUserRole[]>('roles', context.getClass());

    const user = request.user;
    let social: Forum;
    if (sid) {
      social = await this.forumModel.findById(sid);
    } else if (sname) {
      social = await this.forumModel.findOne({ name: sname });
    }
    const userSocial = user.socials.find(rs => rs.social.toHexString() === social.id);
    request.social = social;
    if (!mustAffectSocialType || mustAffectSocialType === socialType) {
      const onlyCreator = !!expectedRoles?.includes(SocialUserRole.CREATOR);
      return this._isUserLegalToAction(userSocial, social.permissionRoles || DEFAULT_PERMISSION_ROLES, expectedPermissionRoles, onlyCreator);
    } else {
      return true;
    }
  }

  private _isUserLegalToAction(userSocial, permissionRoles: PermissionRoles, expectedPermissionRoles: any[], onlyCreator: boolean) {
    const isUserInGroup = userSocial !== undefined;
    const isCreator = userSocial.role === SocialUserRole.CREATOR;
    if (onlyCreator) {
      return isCreator;
    } else if (expectedPermissionRoles) {
      if (!isUserInGroup) {
        return false;
      } else if (isCreator) {
        return true;
      } else {
        return expectedPermissionRoles.every(pr => permissionRoles[pr]);
      }
    } else {
      return true;
    }
  }
}
