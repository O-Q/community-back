import { MinLength, IsString, MaxLength, Matches } from 'class-validator';

export class AuthCredentialSignInDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/(?=.*\d)/, { message: 'should contain at least one digit' })
  @Matches(/(?=.*[a-zA-Z])/, { message: 'should contain at least one word' })
  password: string;
}
