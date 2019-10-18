import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Types, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Group } from '../interfaces/group.interface';
import { JwtPayload } from '../../auth/jwt/jwt-payload.interface';
import { decodeToken } from '../../utils/functions/token-docoder.func';
import { User } from '../../user/interfaces/user.interface';
// TODO: need complete validate if token exists
@Injectable()
export class PrivateGroupGuard implements CanActivate {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<Group>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const gid = request.params.gid;
    if (Types.ObjectId.isValid(gid)) {
      const group: Group = await this.groupModel.findById(gid).lean();
      if (!group.private) {
        return true;
      } else {
        const token: string = request.headers.authorization;
        if (token) {
          const payload: JwtPayload = decodeToken(token);
          const user = await this.userModel.findOne({
            username: payload.username,
          });
          const found = user.groups.find(g => g.group.toHexString() === gid);
          return found !== undefined;
        } else {
          return false;
        }
      }
    }
  }
}
