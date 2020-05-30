import { CanActivate, ExecutionContext, Injectable, HttpException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Types, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Forum } from '../interfaces/forum.interface';
import { JwtPayload } from '../../auth/jwt/jwt-payload.interface';
import { decodeToken } from '../../utils/functions/token-decoder.func';
import { User } from '../../user/interfaces/user.interface';

@Injectable()
export class PrivateForumGuard implements CanActivate {
  constructor(
    @InjectModel('Social') private readonly forumModel: Model<Forum>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const name = request.query.n;
    const forum: Forum = await this.forumModel.findOne({ name }).lean();

    const token: string = request.headers.authorization;
    const payload: JwtPayload = decodeToken(token);
    console.log(payload);

    if (!payload || payload.exp * 1000 < Date.now()) { // token expires
      // TODO: permit user to access or not? for now permit
      // throw new UnauthorizedException();
    } else {
      const user = await this.userModel.findOne({
        username: payload?.username,
      });
      request.user = user;
    }
    if (!forum?.private || (token && request.user?.socials.some(s => s.social.equals(forum._id)))) {
      return true;
    } else {
      throw new NotFoundException();
    }

  }
}
