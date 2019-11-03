import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsPositive,
  MinLength,
  MaxLength,
} from 'class-validator';
import { PostSortBy } from '../enums/sort-post.enum';

export class SocialPostQuery {
  @IsPositive()
  @IsNotEmpty()
  page: number;

  @IsPositive()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  itemsPerPage: number;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsEnum(PostSortBy)
  @IsOptional()
  sortBy: PostSortBy;
}
