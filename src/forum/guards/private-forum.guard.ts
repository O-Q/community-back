import { CanActivate, ExecutionContext, Injectable, HttpException, NotFoundException } from '@nestjs/common';
import { Types, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Forum } from '../interfaces/forum.interface';
import { JwtPayload } from '../../auth/jwt/jwt-payload.interface';
import { decodeToken } from '../../utils/functions/token-decoder.func';
import { User } from '../../user/interfaces/user.interface';
import atob = require('atob');

@Injectable()
export class PrivateForumGuard implements CanActivate {
  constructor(
    @InjectModel('Social') private readonly forumModel: Model<Forum>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const name = request.params.sname;

    const forum: Forum = await this.forumModel.findOne({ name }).lean();
    if (!forum?.private) {
      return true;
    } else {
      // not tested
      const token: string = request.headers.authorization;
      if (token) {
        const payload: JwtPayload = decodeToken(token);
        const user = await this.userModel.findOne({
          username: payload.username,
        });

        const found = user.socials.some(s => s.social.equals(forum._id));
        if (found) {
          return true;
        }
      }
      throw new NotFoundException();
    }
  }
}
