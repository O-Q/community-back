import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsInstance,
  ValidateNested,
} from 'class-validator';
import { RuleGroup } from './rule-group.dto';
import { Type } from 'class-transformer';

export class GroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => RuleGroup)
  rules: RuleGroup[];
}
