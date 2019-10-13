import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { SortByGroup } from '../enums/sort-group.enum';

export class GroupQuery {
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

  @IsEnum(SortByGroup)
  @IsOptional()
  sortBy: SortByGroup;
}
