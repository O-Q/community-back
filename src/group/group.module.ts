import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupSchema } from './schemas/group.schema';
import { PrivateGroupGuard } from './guards/private-group.guard';
import { UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'Group', schema: GroupSchema },
      { name: 'User', schema: UserSchema },

      // { name: 'Post', schema: PostSchema },
    ]),
  ],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}
