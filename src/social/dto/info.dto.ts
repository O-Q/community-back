import { SocialStatus } from '../enums/social-status.enum';
import { IsString, IsNotEmpty, IsBase64, IsBoolean, IsIn, IsOptional, IsArray } from 'class-validator';
import { messages } from '../../utils/constants/messages.const';

export class InfoDto {

    @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
    @IsString({ message: messages.validator.IS_STRING })
    description: string;

    @IsOptional()
    @IsString({ message: messages.validator.IS_STRING })
    aboutMe: string;

    @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
    @IsString({ message: messages.validator.IS_STRING })
    title: string;

    @IsArray({ message: messages.validator.IS_ARRAY })
    @IsString({ each: true, message: messages.validator.IS_STRING })
    flairs: string[];

    @IsBoolean({ message: messages.validator.IS_BOOLEAN })
    isPrivate: boolean;

    @IsIn([SocialStatus.ACTIVE, SocialStatus.INACTIVE])
    status: SocialStatus;


    colors?: any;
}
