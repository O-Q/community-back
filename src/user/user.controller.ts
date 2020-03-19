import {
  Controller,
  Get,
  UseGuards,
  Patch,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { GetUser } from './decorators/get-user.decorator';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { UserDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';

@Controller('user')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private userService: UserService) { }
  @Get()
  getUser(@GetUser() user: User): Promise<User> {
    return this.userService.getUser(user);
  }

  @Patch()
  updateUser(
    @GetUser() user: User,
    @Body(ValidationPipe) updatedUser: UserDto,
  ): Promise<void> {
    return this.userService.updateUser(user, updatedUser);
  }

  @Get('/socials')
  getSocials(@GetUser() user: User): Promise<any> {
    return this.userService.getSocials(user);
  }
}
