import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsPositive,
  MaxLength,
  IsNumberString,
} from 'class-validator';
import { SortByForum } from '../enums/sort-social.enum';
import { messages } from '../../utils/constants/messages.const';

export class SocialQuery {
  // @IsNumber()
  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsNumberString({ message: messages.validator.IS_NUMBER })
  page: string;

  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsNumberString({ message: messages.validator.IS_NUMBER })
  itemsPerPage: string;

  @IsOptional()
  @IsString({ message: messages.validator.IS_STRING })
  @MinLength(3)
  text: string; // it's used for search. being required handles by front-end

  @IsOptional()
  @IsEnum(SortByForum)
  sortBy: SortByForum;
}
