import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Param,
  UseGuards,
  Get,
  Query,
  Request,
  Header,
} from '@nestjs/common';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/interfaces/user.interface';
import { AuthGuard } from '@nestjs/passport';
import { SocialParams } from '../social/dto/social-params.dto';
import { SocialDto } from '../social/dto/social.dto';
import { SocialQuery } from '../social/dto/social-query.dto';
import { PrivateForumGuard } from './guards/private-forum.guard';
import { SocialNameParams } from '../social/dto/social-name-params.dto';
import { ActiveUserGuard } from '../user/guards/active-user.guard';
import { ForumService } from './forum.service';

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
  @Get('/:sname')
  getGroupByName(@Param(ValidationPipe) forumParams: SocialNameParams) {
    return this.forumService.getForumByName(forumParams.sname);
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
  @Post('/:sid/user')
  joinUserToForum(
    @Param(ValidationPipe) socialParams: SocialParams,
    @GetUser() user: User,
  ) {
    // return this.forumService.joinUserToForum(socialParams.sid, user);
  }

  // TODO
  deleteForumById() { }
}
