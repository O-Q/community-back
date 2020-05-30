import {
  MinLength,
  IsString,
  MaxLength,
  Matches,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';
import { UserRole } from '../../user/enums/user-roles.enum';
import { AuthCredentialSignInDto } from './auth-credential-signin.dto';
import { messages } from '../../../messages.const';

export class AuthCredentialDto extends AuthCredentialSignInDto {
  @IsOptional()
  @IsString({ message: messages.validator.IS_STRING })
  @IsEmail(undefined, { message: messages.validator.IS_EMAIL })
  email: string;
}
