import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialSchema } from '../social/schemas/social.schema';

@Module({
  // no need to import user schema. added in auth module
  imports: [AuthModule,
    MongooseModule.forFeature([
      { name: 'Social', schema: SocialSchema }])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule { }
