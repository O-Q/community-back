import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../user/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../config/jwt.config';

@Module({
  providers: [EventsGateway],
  imports: [AuthModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
    ]), JwtModule.register(jwtConfig),
    // don't delete JWTModule. it will needed in WsAuthGuard

  ],
})
export class EventsModule { }
