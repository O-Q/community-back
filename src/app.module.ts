import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { GroupModule } from './group/group.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { EventsModule } from './events/events.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/community', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }),
    AuthModule,
    AdminModule,
    GroupModule,
    UserModule,
    PostModule,
    EventsModule,
  ],
  providers: [],
})
export class AppModule {}
