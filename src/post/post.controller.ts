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

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/group/:id')
  getPostsByGroupId(@Param(ValidationPipe) groupParams: GroupParams) {}

  @UseGuards(AuthGuard())
  @Post('/group/:id')
  createPostByGroupId(
    @Param(ValidationPipe) groupParams: GroupParams,
    @Body(ValidationPipe) createPostDto: CreatePostDto,
    @GetUser() user: User,
  ) {
    return this.postService.createPostByGroupId(
      createPostDto,
      groupParams.id,
      user,
    );
  }

  @UseGuards(AuthGuard())
  @Post('/group/:id/replay')
  createReplyPostByGroupId(
    @Param(ValidationPipe) groupParams: GroupParams,
    @Body(ValidationPipe) createPostDto: CreateReplyPostDto,
    @GetUser() user: User,
  ) {
    return this.postService.createReplayPostByGroupId(
      createPostDto,
      groupParams.id,
      user,
    );
  }

  @UseGuards(AuthGuard())
  @Delete('/:id')
  deletePostById(
    @Param(ValidationPipe) postParams: PostParams,
    @GetUser() user: User,
  ) {
    return this.postService.deletePostById(postParams.id, user);
  }

  @UseGuards(AuthGuard())
  @Patch('/:id')
  editPostById(
    @Param(ValidationPipe) postParams: PostParams,
    @GetUser() user: User,
    @Body(ValidationPipe) editPostDto: EditPostDto,
  ) {
    return this.postService.editPostById(editPostDto, postParams.id, user);
  }
}
