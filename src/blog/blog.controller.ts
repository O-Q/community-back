import { Controller, Get, Param } from '@nestjs/common';
import { SocialParams } from '../social/dto/social-params.dto';

@Controller('blog')
export class BlogController {
  @Get(':sid')
  getBlogById(@Param() socialParams: SocialParams) {}

  delete;
}
