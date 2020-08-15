import { MinLength, IsString, MaxLength, Matches } from 'class-validator';
import { messages } from '../../utils/constants/messages.const';

export class AuthCredentialSignInDto {
  @IsString({ message: messages.validator.IS_STRING })
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString({ message: messages.validator.IS_STRING })
  @MinLength(6)
  @MaxLength(20)
  @Matches(/(?=.*\d)/, { message: messages.validator.AT_LEAST_ONE_DIGIT })
  @Matches(/(?=.*[a-zA-Z])/, { message: messages.validator.AT_LEAST_ONE_LETTER })
  password: string;
}
