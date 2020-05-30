import { Controller, Get, Param, UseGuards, Post, ValidationPipe, Body, Query, Patch, UseInterceptors, Delete, UploadedFile } from '@nestjs/common';
import { SocialParams } from '../social/dto/social-params.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/interfaces/user.interface';
import { SocialDto } from '../social/dto/social.dto';
import { BlogService } from './blog.service';
import { SocialNameQuery } from '../social/dto/social-name-query.dto';
import { InfoDto } from '../social/dto/info.dto';
import { FileInterceptor } from '../utils/multer';
import { File } from 'fastify-multer/lib/interfaces';
import { UserGetterGuard } from '../user/guards/user-getter.guard';
import { SocialGuard } from '../forum/guards/forum.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SocialUserRole } from '../user/enums/social-user-role.enum';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) { }
  // @Get(':sid')
  // getBlogById(@Param() socialParams: SocialParams) {}

  @UseGuards(UserGetterGuard)
  @Get('name')
  getForumByName(@Query(ValidationPipe) socialQuery: SocialNameQuery, @GetUser() user: User) {
    return this.blogService.getBlogByName(socialQuery.n, user);
  }

  @Roles([SocialUserRole.CREATOR])
  @UseGuards(AuthGuard(), SocialGuard)
  @Delete('/:sid')
  deleteBlog(@Param(ValidationPipe) socialParams: SocialParams) {
    return this.blogService.deleteBlog(socialParams.sid);
  }

  @UseGuards(AuthGuard())
  @Post()
  createForum(
    @GetUser() user: User,
    @Body(ValidationPipe) socialDto: SocialDto,
  ) {
    return this.blogService.createBlog(user, socialDto);
  }
  @UseGuards(AuthGuard())
  @Patch('/info')
  updateInfo(@GetUser() user: User, @Body(ValidationPipe) infoDto: InfoDto, @Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.blogService.updateInfo(user, socialQuery.n, infoDto);
  }

  @UseGuards(AuthGuard())
  @Post('/banner')
  @UseInterceptors(FileInterceptor('banner'))
  uploadBanner(@GetUser() user: User, @UploadedFile() file: File, @Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.blogService.updateImage(user, socialQuery.n, file, 'banner');
  }
  @UseGuards(AuthGuard())
  @Delete('/banner')
  removeBanner(@Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.blogService.removePhoto(socialQuery.n, 'banner');
  }

  @UseGuards(AuthGuard())
  @Post('/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(@GetUser() user: User, @UploadedFile() file: File, @Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.blogService.updateImage(user, socialQuery.n, file, 'avatar');
  }
  @UseGuards(AuthGuard())
  @Delete('/avatar')
  removeAvatar(@Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.blogService.removePhoto(socialQuery.n, 'avatar');
  }
}
