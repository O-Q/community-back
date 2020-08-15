import { IsString, MinLength, IsNotEmpty, IsMongoId, IsEnum } from 'class-validator';
import { messages } from '../../utils/constants/messages.const';
import { SocialType } from '../../user/interfaces/user.interface';

export class CreateReplyPostDto {
  @IsString({ message: messages.validator.IS_STRING })
  @MinLength(15, { message: messages.validator.MUST_BE_AT_LEAST_15 })
  comment: string;

  @IsEnum(SocialType, { message: 'مقدار باید یا "FORUM" یا "BLOG" باشد.' })
  socialType: SocialType;
}
