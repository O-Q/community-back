import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { EventsModule } from './events/events.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ForumModule } from './forum/forum.module';
import { BlogModule } from './blog/blog.module';
import { SearchModule } from './search/search.module';
import { ScheduledModule } from './scheduled/scheduled.module';
import { LoggerModule } from './logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/community', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }),
    AuthModule,
    AdminModule,
    ForumModule,
    UserModule,
    PostModule,
    EventsModule,
    BlogModule,
    SearchModule,
    ScheduledModule,
    LoggerModule,
    ScheduleModule.forRoot(),
  ]
})
export class AppModule { }
