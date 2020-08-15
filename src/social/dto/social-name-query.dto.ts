import { IsString, IsNotEmpty } from 'class-validator';
import { messages } from '../../utils/constants/messages.const';

export class SocialNameQuery {
  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsString({ message: messages.validator.IS_STRING })
  n: string;
}
