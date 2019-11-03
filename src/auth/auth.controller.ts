import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialSignInDto } from './dto/auth-credential-signin.dto';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { User } from '../user/interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Post('/signup')
  signUp(
    @Body(ValidationPipe) authCredentialDto: AuthCredentialDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signUp(authCredentialDto);
  }

  @HttpCode(200)
  @Post('/signin')
  signIn(
    @Body(ValidationPipe) authCredentialSignInDto: AuthCredentialSignInDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialSignInDto);
  }
}
