import { Controller, Req, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-roles.enum';
import { GetUser } from '../user/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@Roles(UserRole.ADMIN)
@UseGuards(AuthGuard())
export class AdminController {
  @Get('/users')
  getUsers(@GetUser() user) {
    console.log(user);
  }
}
