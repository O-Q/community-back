import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import { decodeToken } from '../../utils/functions/token-decoder.func';
import { JwtPayload } from '../../auth/jwt/jwt-payload.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserGetterGuard implements CanActivate {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
    ) { }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token: string = request.headers.authorization;
        const payload: JwtPayload = decodeToken(token);
        if (!token || payload.exp * 1000 < Date.now()) { // token expires
            request.user = null;
        } else {
            const user = await this.userModel.findOne({
                username: payload?.username,
            });
            request.user = user;
        }
        return true;
    }
}
