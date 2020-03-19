import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsPositive,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostSortBy } from '../enums/sort-post.enum';

export class SocialPostQuery {
  @Type(() => Number)
  @IsNotEmpty()
  page: number;

  @Type(() => Number)
  @IsPositive()
  @IsNotEmpty()
  @Min(5)
  @Max(100)
  itemsPerPage: number;

  @IsOptional()
  @IsString()
  text: string;

  @IsEnum(PostSortBy)
  @IsOptional()
  sortBy: PostSortBy;
}
