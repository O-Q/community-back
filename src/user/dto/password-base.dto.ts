import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { messages } from '../../utils/constants/messages.const';

export class PasswordBase {

    @IsString({ message: messages.validator.IS_STRING })
    @MinLength(6)
    @MaxLength(20)
    @Matches(/(?=.*\d)/, { message: messages.validator.AT_LEAST_ONE_DIGIT })
    @Matches(/(?=.*[a-zA-Z])/, { message: messages.validator.AT_LEAST_ONE_LETTER })
    currentPassword: string;
}