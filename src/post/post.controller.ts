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
  Req,
  Inject,
  Headers,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReplyPostDto } from './dto/reply-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User, SocialType } from '../user/interfaces/user.interface';
import { PostParams, ReplyPostParams } from './dto/post-params.dto';
import { EditPostDto } from './dto/edit-post.dto';
import { SocialGuard } from '../forum/guards/forum.guard';
import { SocialPostQuery } from './dto/social-post.query.dto';
import { PrivateForumGuard } from '../forum/guards/private-forum.guard';
import { SocialParams } from '../social/dto/social-params.dto';
import { UserPostsQuery } from './dto/get-user-posts-query.dto';
import { ReactionDto } from './dto/react.dto';
import { PostPrivacyGuard } from './guards/privacy.guard';
import { FileInterceptor, AnyFilesInterceptor, FilesInterceptor } from '../utils/multer';
import { File } from 'fastify-multer/lib/interfaces';
import { SocialTypes } from './../auth/decorators/socialType.decorator';
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

  @UseGuards(PrivateForumGuard)
  @Get('/social')
  getPostsBySocialName(@GetUser() user: User,
    @Query(ValidationPipe) query: SocialPostQuery
  ) {
    if (query.text) {
      return this.postService.getSearchedPostsBySocialName(query);
    } else {
      return this.postService.getPostsBySocialName(query, user);
    }
  }

  @UseGuards(PostPrivacyGuard)
  @Get('/user')
  getUserPosts(
    @GetUser() user: User,
    @Query(ValidationPipe) userPostsQuery: UserPostsQuery,
  ) {
    return this.postService.getUserPosts(userPostsQuery, user);
  }

  @UseGuards()
  @Post('/upload')
  @UseInterceptors(FileInterceptor('upload'))
  uploadImage(
    @GetUser() user: User,
    @Headers() headers,
    @UploadedFile() file: File,
  ) {
    const socialType = headers.social_type;
    const sname = headers.sname;
    return this.postService.uploadImage(user, socialType, sname, file);
  }
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

  @UseGuards(AuthGuard())
  @Post('/i/:pid/reaction')
  reactToPostById(@Param(ValidationPipe) postParams: PostParams, @Body(ValidationPipe) reactionDto: ReactionDto, @GetUser() user: User) {
    return this.postService.reactToPostById(user, postParams.pid, reactionDto.reaction);
  }

  @UseGuards(PrivateForumGuard)
  @Get('/i/:pid')
  getPostByPostId(@Param(ValidationPipe) postParams: PostParams, @GetUser() user: User) {
    return this.postService.getPostById(postParams, user);
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

  @SocialTypes(SocialType.FORUM)
  @UseGuards(AuthGuard(), SocialGuard)
  @Post('/i/:pid/social/:sid/reply')
  createReplyPostBySocialName(
    @Param(ValidationPipe) postParams: ReplyPostParams,
    @Body(ValidationPipe) createReplyPostDto: CreateReplyPostDto,
    @GetUser() user: User,
  ) {
    return this.postService.createReplyPostBySocialName(
      createReplyPostDto,
      postParams,
      user,
    );
  }

  // TODO: must add SocialGuard to guard but need sid
  @UseGuards(AuthGuard())
  @Delete('/i/:pid')
  deletePostById(
    @Param(ValidationPipe) postParams: PostParams,
    @Query('socialType') socialType: SocialType,
    @GetUser() user: User,
  ) {
    return this.postService.deletePostById(postParams.pid, user, socialType);
  }


  // TODO: must add SocialGuard to guard but need sid
  @UseGuards(AuthGuard())
  @Patch('/i/:pid')
  editPostById(
    @Param(ValidationPipe) postParams: PostParams,
    @GetUser() user: User,
    @Body(ValidationPipe) editPostDto: EditPostDto,
  ) {
    return this.postService.editPostById(editPostDto, postParams.pid, user);
  }

}
