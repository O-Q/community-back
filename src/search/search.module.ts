import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from '../post/schemas/post.schema';
import { SocialSchema } from '../social/schemas/social.schema';
import { UserSchema } from '../user/schemas/user.schema';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'Social', schema: SocialSchema },
      { name: 'User', schema: UserSchema },
    ]),
    LoggerModule,
  ],
  providers: [SearchService],
  controllers: [SearchController]
})
export class SearchModule { }
