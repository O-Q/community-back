import { Module } from '@nestjs/common';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialSchema } from '../social/schemas/social.schema';
import { UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'Social', schema: SocialSchema },
      { name: 'User', schema: UserSchema },
      // { name: 'Post', schema: PostSchema },
    ]),
  ],
  providers: [ForumService],
  controllers: [ForumController],
})
export class ForumModule { }
