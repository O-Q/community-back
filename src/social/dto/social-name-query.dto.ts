import { IsString, IsNotEmpty } from 'class-validator';
import { messages } from '../../../messages.const';

export class SocialNameQuery {
  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsString({ message: messages.validator.IS_STRING })
  n: string;
}
