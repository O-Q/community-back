import { IsString, IsNotEmpty } from 'class-validator';
import { messages } from '../../../messages.const';

export class RuleSocial {
  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsString({ message: messages.validator.IS_STRING })
  subject: string;

  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsString({ message: messages.validator.IS_STRING })
  description: string;
}
