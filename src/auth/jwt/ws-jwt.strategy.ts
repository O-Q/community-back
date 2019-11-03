import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { jwtConfig } from '../../config/jwt.config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../user/interfaces/user.interface';
import { JwtPayload } from './jwt-payload.interface';
import { WsException } from '@nestjs/websockets';
import { DBErrorHandler } from '../../utils/error-handlers/db.handler';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'WsJwtStrategy') {

    constructor(@InjectModel('User') private readonly userModel: Model<User>) {
        super({
            jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
            secretOrKey: jwtConfig.secret,
        });
    }
    /**
     * run where WsAuthGuard exits.
     * find user with user. `password` deselected.
     * @param payload JWT token user sends in headers
     */
    async validate(payload: JwtPayload): Promise<User> {
        const { username } = payload;
        const user = await this.userModel.findOne({ username }, { password: 0 });

        if (!user) {
            throw new WsException('Unauthorized');
        }
        return user;
    }
}
