import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './schemas/post.schema';
import { AuthModule } from '../auth/auth.module';
import { GroupSchema } from '../group/schemas/group.schema';
import { UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'Group', schema: GroupSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
