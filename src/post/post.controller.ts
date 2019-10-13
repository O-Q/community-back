import {
  Controller,
  Get,
  Param,
  ValidationPipe,
  Post,
  Body,
  UseGuards,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { GroupParams } from '../group/dto/group-params.dto';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReplyPostDto } from './dto/reply-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/interfaces/user.interface';
import { PostParams } from './dto/post-params.dto';
import { EditPostDto } from './dto/edit-post.dto';
import { GroupGuard } from '../group/guards/group.guard';
import { GroupPostQuery } from './dto/group-post.query.dto';

/**
 * ✔ 1,2. Get post (with and without filter) by group id. for now subject and text filtered
 * ✔ 3. Create Post by group id
 * ✔ 4. Create reply post by group id
 * ✔ 5. Delete post by group id
 * ✔ 6. Edit post by group id
 * 7. Get Post sorted by new, hot, top. for hot and top must be weekly maybe to avoid very old posts
 */
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/group/:gid')
  getPostsByGroupId(
    @Param(ValidationPipe) groupParams: GroupParams,
    @Query() query: GroupPostQuery,
  ) {
    if (query.text) {
      return this.postService.getSearchedPostsByGroupId(groupParams.gid, query);
    } else {
      return this.postService.getPostsByGroupId(groupParams.gid, query);
    }
  }

  @Get('/:pid/group/:gid')
  getPostByGroupId(@Param(ValidationPipe) postParams: PostParams) {
    return this.postService.getPostById(postParams);
  }

  @UseGuards(AuthGuard(), GroupGuard)
  @Post('/group/:gid')
  createPostByGroupId(
    @Param(ValidationPipe) groupParams: GroupParams,
    @Body(ValidationPipe) createPostDto: CreatePostDto,
    @GetUser() user: User,
  ) {
    return this.postService.createPostByGroupId(
      createPostDto,
      groupParams.gid,
      user,
    );
  }

  @UseGuards(AuthGuard(), GroupGuard)
  @Post(':pid/group/:gid/replay')
  createReplyPostByGroupId(
    @Param(ValidationPipe) postParams: PostParams,
    @Body(ValidationPipe) createReplyPostDto: CreateReplyPostDto,
    @GetUser() user: User,
  ) {
    return this.postService.createReplayPostByGroupId(
      createReplyPostDto,
      postParams.gid,
      user,
    );
  }

  @UseGuards(AuthGuard(), GroupGuard)
  @Delete('/:pid/group/:gid')
  deletePostById(
    @Param(ValidationPipe) postParams: PostParams,
    @GetUser() user: User,
  ) {
    return this.postService.deletePostById(postParams.pid, user);
  }

  @UseGuards(AuthGuard(), GroupGuard)
  @Patch('/:pid/group/:gid')
  editPostById(
    @Param(ValidationPipe) postParams: PostParams,
    @GetUser() user: User,
    @Body(ValidationPipe) editPostDto: EditPostDto,
  ) {
    return this.postService.editPostById(editPostDto, postParams.pid, user);
  }
}
