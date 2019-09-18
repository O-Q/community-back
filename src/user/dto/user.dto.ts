import {
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { AuthCredentialSignInDto } from '../../auth/dto/auth-credential-signin.dto';

export class UserDto extends AuthCredentialSignInDto {
  username: string;

  @IsOptional()
  password: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  phone: string;

  @IsOptional()
  @IsString()
  description: string;
}
