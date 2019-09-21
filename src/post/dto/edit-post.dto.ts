import { CreatePostDto } from './create-post.dto';
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class EditPostDto extends CreatePostDto {}
