import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  // no need to import user schema. added in auth module
  imports: [AuthModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
