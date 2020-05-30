import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UnauthorizedException, Injectable } from '@nestjs/common';

import { jwtConfig } from '../../config/jwt.config';
import { JwtPayload } from './jwt-payload.interface';
import { User } from '../../user/interfaces/user.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  /**
   * run where AuthGuard exits.
   * find user with user. `password` deselected.
   * @param payload JWT token user sends in headers
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userModel.findOne(
      {
        username: payload.username,
      },
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
