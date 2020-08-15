import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { PasswordBase } from './password-base.dto';
import { messages } from '../../utils/constants/messages.const';

export class ChangeEmailDto extends PasswordBase {
    @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
    @IsString({ message: messages.validator.IS_STRING })
    @IsEmail(undefined, { message: messages.validator.IS_EMAIL })
    email: string;
}
