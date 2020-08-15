import { IsString, MinLength, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { messages } from '../../utils/constants/messages.const';

export class CreatePostDto {
  @IsString({ message: messages.validator.IS_STRING })
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString({ message: messages.validator.IS_STRING })
  subtitle?: string;

  @IsString({ message: messages.validator.IS_STRING })
  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  text: string;


  @IsOptional()
  @IsArray({ message: messages.validator.IS_ARRAY })
  @IsString({ each: true, message: messages.validator.IS_STRING })
  flairs?: string[];
}
