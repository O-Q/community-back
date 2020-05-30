import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialSchema } from '../social/schemas/social.schema';
import { UserSchema } from '../user/schemas/user.schema';
import { PostSchema } from '../post/schemas/post.schema';

@Module({
  imports: [AuthModule,
    MongooseModule.forFeature([
      { name: 'Social', schema: SocialSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Post', schema: PostSchema },
    ])],
  providers: [BlogService],
  controllers: [BlogController],
})
export class BlogModule { }
