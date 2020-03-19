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
import { SocialParams } from '../social/dto/social-params.dto';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReplyPostDto } from './dto/reply-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/interfaces/user.interface';
import { PostParams } from './dto/post-params.dto';
import { EditPostDto } from './dto/edit-post.dto';
import { SocialGuard } from '../forum/guards/forum.guard';
import { SocialPostQuery } from './dto/social-post.query.dto';
import { PrivateForumGuard } from '../forum/guards/private-forum.guard';

/**
 * ✔ ❗ 1,2. Get post (with and without filter) by social id. for now subject and text filtered
 * ✔ ❗ 3. Create Post by social id
 * ✔ ❗ 4. Create reply post by social id
 * ✔ ❗ 5. Delete post by social id
 * ✔ ❗ 6. Edit post by social id
 * 7. Get Post sorted by new, hot, top. for hot and top must be weekly maybe to avoid very old posts
 */
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Get('/social/:sname')
  getPostsBySocialId(
    @Param(ValidationPipe) socialParams: { sname },
    @Query(ValidationPipe) query: SocialPostQuery,
  ) {
    if (query.text) {
      return this.postService.getSearchedPostsBySocialId(
        socialParams.sname,
        query,
      );
    } else {
      return this.postService.getPostsBySocialName(socialParams.sname, query);
    }
  }

  @UseGuards(PrivateForumGuard)
  @Get('/:pid/social/:sname')
  getPostBySocialName(@Param(ValidationPipe) postParams: PostParams) {
    return this.postService.getPostBySocialName(postParams);
  }

  // @UseGuards(AuthGuard(), SocialGuard)
  // @Post('/social/:sid')
  // createPostBySocialId(
  //   @Param(ValidationPipe) socialParams: SocialParams,
  //   @Body(ValidationPipe) createPostDto: CreatePostDto,
  //   @GetUser() user: User,
  // ) {
  //   return this.postService.createPostByGroupId(
  //     createPostDto,
  //     socialParams.sid,
  //     user,
  //   );
  // }
  @UseGuards(AuthGuard(), SocialGuard)
  @Post('/social/:sid')
  createPostBySocialId(
    @Param(ValidationPipe) socialParams: SocialParams,
    @Body(ValidationPipe) createPostDto: CreatePostDto,
    @GetUser() user: User,
  ) {
    return this.postService.createPostBySocialId(
      createPostDto,
      socialParams.sid,
      user,
    );
  }
  @UseGuards(AuthGuard(), SocialGuard)
  @Post(':pid/social/:sname/replay')
  createReplyPostBySocialName(
    @Param(ValidationPipe) postParams: PostParams,
    @Body(ValidationPipe) createReplyPostDto: CreateReplyPostDto,
    @GetUser() user: User,
  ) {
    return this.postService.createReplayPostBySocialName(
      createReplyPostDto,
      postParams.sname,
      user,
    );
  }

  @UseGuards(AuthGuard(), SocialGuard)
  @Delete('/:pid/social/:sid')
  deletePostById(
    @Param(ValidationPipe) postParams: PostParams,
    @GetUser() user: User,
  ) {
    return this.postService.deletePostById(postParams.pid, user);
  }

  @UseGuards(AuthGuard(), SocialGuard)
  @Patch('/:pid/social/:sid')
  editPostById(
    @Param(ValidationPipe) postParams: PostParams,
    @GetUser() user: User,
    @Body(ValidationPipe) editPostDto: EditPostDto,
  ) {
    return this.postService.editPostById(editPostDto, postParams.pid, user);
  }
}
