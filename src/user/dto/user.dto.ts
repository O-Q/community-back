import {
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { AuthCredentialSignInDto } from '../../auth/dto/auth-credential-signin.dto';
import { messages } from '../../utils/constants/messages.const';

export class UserDto extends AuthCredentialSignInDto {

  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsString({ message: messages.validator.IS_STRING })
  username: string;

  @IsOptional()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/(?=.*\d)/, { message: messages.validator.AT_LEAST_ONE_DIGIT })
  @Matches(/(?=.*[a-zA-Z])/, { message: messages.validator.AT_LEAST_ONE_LETTER })
  password: string;

  @IsEmail(undefined, { message: messages.validator.IS_EMAIL })
  email: string;

  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsNumber(undefined, { message: messages.validator.IS_NUMBER })
  phone: string;

  @IsOptional()
  @IsString({ message: messages.validator.IS_STRING })
  description: string;
}
