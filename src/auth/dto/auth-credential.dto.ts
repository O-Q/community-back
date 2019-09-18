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

export class AuthCredentialDto extends AuthCredentialSignInDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumberString()
  phone: number;
}
