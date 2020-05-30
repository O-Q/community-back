import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from '../user/schemas/user.schema';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConfig } from '../config/jwt.config';
import { MongooseModule } from '@nestjs/mongoose';
import { WsJwtStrategy } from './jwt/ws-jwt.strategy';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwtConfig),
    LoggerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, WsJwtStrategy],
  exports: [JwtStrategy, PassportModule, WsJwtStrategy],
})
export class AuthModule { }
