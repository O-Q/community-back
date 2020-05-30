import { IsString, MinLength, IsNotEmpty, IsMongoId } from 'class-validator';
import { messages } from '../../../messages.const';

export class CreateReplyPostDto {
  @IsString({ message: messages.validator.IS_STRING })
  @MinLength(15, { message: messages.validator.MUST_BE_AT_LEAST_15 })
  comment: string;
}
