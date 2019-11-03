import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { SortByForum } from '../enums/sort-social.enum';

export class SocialQuery {
  // @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  page: number;

  @IsPositive()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  itemsPerPage: number;

  @MinLength(3)
  @IsString()
  @IsOptional()
  text: string; // it's used for search. being required handles by front-end

  @IsEnum(SortByForum)
  @IsOptional()
  sortBy: SortByForum;
}
