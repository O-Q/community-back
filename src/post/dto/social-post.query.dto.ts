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
import { messages } from '../../utils/constants/messages.const';

export class SocialPostQuery {

  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsString({ message: messages.validator.IS_STRING })
  n: string;

  @Type(() => Number)
  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  page: number;

  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @Type(() => Number)
  @IsPositive({ message: messages.validator.IS_POSITIVE })
  @Min(5)
  @Max(100)
  itemsPerPage: number;

  @IsOptional()
  @IsString({ message: messages.validator.IS_STRING })
  flair: string;

  @IsOptional()
  @IsString({ message: messages.validator.IS_STRING })
  text?: string;

  @IsOptional()
  @IsEnum(PostSortBy)
  sortBy: PostSortBy;
}
