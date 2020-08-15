import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
} from 'class-validator';
import { messages } from '../../utils/constants/messages.const';

export class SocialDto {
  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsString({ message: messages.validator.IS_STRING })
  name: string;

  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsString({ message: messages.validator.IS_STRING })
  description: string;

  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsString({ message: messages.validator.IS_STRING })
  subject: string;

  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsString({ message: messages.validator.IS_STRING })
  title: string;

  @IsOptional()
  @IsArray({ message: messages.validator.IS_ARRAY })
  @IsString({ each: true, message: messages.validator.IS_STRING })
  flairs: string[];
}
