import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from '../user/interfaces/user.interface';
import { DBErrorHandler } from '../utils/error-handlers/db.handler';
import { bcryptRound } from '../config/bcrypt.config';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { AuthCredentialSignInDto } from './dto/auth-credential-signin.dto';
import { JwtPayload } from './jwt/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(authCredentialDto: AuthCredentialDto): Promise<void> {
    // warning: maybe mongo doesn't check uniqueness.
    // see: https://mongoosejs.com/docs/faq.html#unique-doesnt-work
    const { password } = authCredentialDto;
    authCredentialDto.password = await bcrypt.hash(password, bcryptRound);
    const createdUser = new this.userModel(authCredentialDto);
    await createdUser.save().catch(DBErrorHandler);
  }
  async signIn(
    authCredentialSignInDto: AuthCredentialSignInDto,
  ): Promise<{ accessToken: string }> {
    const payload: JwtPayload = await this._validateUserPassword(
      authCredentialSignInDto,
    );
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  private async _validateUserPassword(
    authCredentialSignInDto: AuthCredentialSignInDto,
  ): Promise<JwtPayload> {
    const { username, password } = authCredentialSignInDto;
    const user: User = await this.userModel.findOne({ username });
    if (user && (await this._isValidPassword(password, user.password))) {
      const { email, id } = user;
      return { username, email, id };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  private async _isValidPassword(
    password: string,
    realEncrypted: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, realEncrypted);
  }
}
