import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
  Query,
  Patch,
  UseInterceptors,
  Delete,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/interfaces/user.interface';
import { AuthGuard } from '@nestjs/passport';
import { SocialDto } from '../social/dto/social.dto';
import { SocialQuery } from '../social/dto/social-query.dto';
import { PrivateForumGuard } from './guards/private-forum.guard';
import { SocialNameQuery } from '../social/dto/social-name-query.dto';
import { ForumService } from './forum.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { WidgetDto, WidgetsDto } from '../social/dto/widget.dto';
import { InfoDto } from '../social/dto/info.dto';
import { FileInterceptor } from '../utils/multer';
import { File } from 'fastify-multer/lib/interfaces';
import { SocialParams, SocialUserParams } from '../social/dto/social-params.dto';
import { SocialGuard } from './guards/forum.guard';
import { SocialUserRole } from '../user/enums/social-user-role.enum';
import { GetSocial } from '../social/decorators/get-social.decorator';
import { Forum } from './interfaces/forum.interface';

@Controller('forum')
export class ForumController {
  constructor(private forumService: ForumService) { }

  @Get()
  getForums(@Query(ValidationPipe) query: SocialQuery) {
    if (query.text) {
      // return this.forumService.getSearchedForums(query);
    } else {
      // return this.forumService.getForums(query);
    }
  }
  // @UseGuards(PrivateForumGuard)
  // @Get('/:sid')
  // getForumById(@Param(ValidationPipe) socialParams: SocialParams) {
  //   return this.forumService.getForumById(socialParams.sid);
  // }

  @UseGuards(PrivateForumGuard)
  @Get('name')
  getForumByName(@Query(ValidationPipe) socialQuery: SocialNameQuery, @GetUser() user: User) {
    return this.forumService.getForumByName(socialQuery.n, user);
  }

  @UseGuards(AuthGuard())
  @Post()
  createForum(
    @GetUser() user: User,
    @Body(ValidationPipe) socialDto: SocialDto,
  ) {
    return this.forumService.createForum(user, socialDto);
  }

  @UseGuards(AuthGuard())
  @Post('/join/:sid')
  joinUserToForum(
    @Param(ValidationPipe) socialParams: SocialParams,
    @GetUser() user: User,
  ) {
    return this.forumService.joinUserToForum(socialParams.sid, user);
  }

  @Roles([SocialUserRole.CREATOR, SocialUserRole.MODERATOR])
  @UseGuards(AuthGuard(), SocialGuard)
  @Get('/users')
  getUsers(@Query(ValidationPipe) socialQuery: SocialNameQuery, @GetUser() user: User, @GetSocial() forum: Forum) {
    return this.forumService.getForumUsers(forum);
  }

  @Roles([SocialUserRole.CREATOR, SocialUserRole.MODERATOR])
  @UseGuards(AuthGuard(), SocialGuard)
  @Patch('/users/:sid')
  updateUsers(@Param(ValidationPipe) socialParams: SocialParams, @GetUser() user: User, @Body() users: any) {
    return this.forumService.updateForumUsers(socialParams.sid, user, users);
  }

  @Roles([SocialUserRole.CREATOR, SocialUserRole.MODERATOR])
  @UseGuards(AuthGuard(), SocialGuard)
  @Delete('/users/:sid/:uid')
  removeUser(@Param(ValidationPipe) socialParams: SocialUserParams) {
    return this.forumService.removeUser(socialParams.sid, socialParams.uid);
  }

  @UseGuards(AuthGuard(), SocialGuard)
  @Delete('/leave/:sid')
  leaveUserFromForum(
    @Param(ValidationPipe) socialParams: SocialParams,
    @GetUser() user: User,
  ) {
    return this.forumService.leaveUserFromForum(socialParams.sid, user);
  }

  @Roles([SocialUserRole.CREATOR])
  @UseGuards(AuthGuard(), SocialGuard)
  @Delete('/:sid')
  deleteForumById(@Param(ValidationPipe) socialParams: SocialParams) {
    return this.forumService.DeleteForum(socialParams.sid);
  }

  @UseGuards(AuthGuard())
  @Patch('/widget/bulk')
  updateWidgets(@GetUser() user: User, @Body(ValidationPipe) widgetsDto: WidgetsDto, @Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.forumService.updateWidgets(user, socialQuery.n, widgetsDto.widgets);
  }

  @UseGuards(AuthGuard())
  @Patch('/widget')
  updateWidget(@GetUser() user: User, @Body(ValidationPipe) widgetDto: WidgetDto, @Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.forumService.updateWidget(user, socialQuery.n, widgetDto.widget);
  }

  @UseGuards(AuthGuard())
  @Patch('/info')
  updateInfo(@GetUser() user: User, @Body(ValidationPipe) infoDto: InfoDto, @Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.forumService.updateInfo(user, socialQuery.n, infoDto);
  }

  @UseGuards(AuthGuard())
  @Post('/banner')
  @UseInterceptors(FileInterceptor('banner'))
  uploadBanner(@GetUser() user: User, @UploadedFile() file: File, @Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.forumService.updateImage(user, socialQuery.n, file, 'banner');
  }
  @UseGuards(AuthGuard())
  @Delete('/banner')
  removeBanner(@Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.forumService.removePhoto(socialQuery.n, 'banner');
  }

  @UseGuards(AuthGuard())
  @Post('/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(@GetUser() user: User, @UploadedFile() file: File, @Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.forumService.updateImage(user, socialQuery.n, file, 'avatar');
  }
  @UseGuards(AuthGuard())
  @Delete('/avatar')
  removeAvatar(@Query(ValidationPipe) socialQuery: SocialNameQuery) {
    return this.forumService.removePhoto(socialQuery.n, 'avatar');
  }
  @UseGuards(AuthGuard())
  @Get('/widget/default')
  getAllDefaultWidget() {
    return this.forumService.getAllWidgetList();
  }


}
