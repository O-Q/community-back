import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  // ValidateNested,
  // IsIn,
} from 'class-validator';
// import { Type } from 'class-transformer';

export class SocialDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  // @IsIn()
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  flairs: string[];

  // @IsOptional()
  // @IsArray()
  // @ValidateNested()
  // @Type(() => RuleSocial)
  // rules: RuleSocial[];
}
