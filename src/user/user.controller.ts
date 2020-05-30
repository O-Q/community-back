import {
  Controller,
  Get,
  UseGuards,
  Patch,
  Body,
  ValidationPipe,
  Post,
  UploadedFile,
  UseInterceptors,
  Delete,
  Param,
} from '@nestjs/common';
import { GetUser } from './decorators/get-user.decorator';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { UserDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';
import { ChangeEmailDto } from './dto/email.dto';
import { ChangePasswordDto } from './dto/password.dto';
import { FileInterceptor } from './../utils/multer';
import { File } from 'fastify-multer/lib/interfaces';
import { UserGetterGuard } from './guards/user-getter.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }
  @Get()
  @UseGuards(AuthGuard())
  getUser(@GetUser() user: User): Promise<User> {
    return this.userService.getUser(user);
  }

  @Patch()
  @UseGuards(AuthGuard())
  updateUser(
    @GetUser() user: User,
    @Body(ValidationPipe) updatedUser: UserDto,
  ): Promise<void> {
    return this.userService.updateUser(user, updatedUser);
  }

  @Get('/:username')
  @UseGuards(UserGetterGuard)
  getUserInfo(@Param('username', ValidationPipe) username: string, @GetUser() user: User) {
    return this.userService.getUserInfo(username, user);
  }

  @Post('/:username/follow')
  @UseGuards(AuthGuard())
  followUser(@GetUser() user: User, @Param('username', ValidationPipe) username: string) {
    return this.userService.followUser(user, username);
  }

  @Post('/:username/unfollow')
  @UseGuards(AuthGuard())
  unFollowUser(@GetUser() user: User, @Param('username', ValidationPipe) username: string) {
    return this.userService.unFollowUser(user, username);
  }

  @Get('/socials')
  @UseGuards(AuthGuard())
  getSocials(@GetUser() user: User): Promise<any> {
    return this.userService.getSocials(user);
  }

  @Patch('/account/email')
  @UseGuards(AuthGuard())
  changeEmail(@GetUser() user: User, @Body(ValidationPipe) changeEmailDto: ChangeEmailDto): Promise<any> {
    return this.userService.updateEmail(user, changeEmailDto.currentPassword, changeEmailDto.email);
  }

  @Patch('/account/password')
  @UseGuards(AuthGuard())
  changePassword(@GetUser() user: User, @Body(ValidationPipe) changePasswordDto: ChangePasswordDto): Promise<any> {
    return this.userService.updatePassword(user, changePasswordDto.currentPassword, changePasswordDto.password);
  }


  @Post('/banner')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('banner'))
  uploadBanner(@GetUser() user: User, @UploadedFile() file: File) {
    return this.userService.updateImage(user, file, 'banner');
  }
  @Delete('/banner')
  @UseGuards(AuthGuard())
  removeBanner(@GetUser() user: User) {
    return this.userService.removePhoto(user, 'banner');
  }

  @Post('/avatar')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(@GetUser() user: User, @UploadedFile() file: File) {
    return this.userService.updateImage(user, file, 'avatar');
  }
  @Delete('/avatar')
  @UseGuards(AuthGuard())
  removeAvatar(@GetUser() user: User) {
    return this.userService.removePhoto(user, 'avatar');
  }

  @Patch('/privacy')
  @UseGuards(AuthGuard())
  updatePrivacy(@GetUser() user: User, @Body() privacyDto: any) {
    return this.userService.updatePrivacy(user, privacyDto);
  }
}
