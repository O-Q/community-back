import { IsNotEmpty, IsMongoId, IsString, IsOptional, IsEnum } from 'class-validator';
import { messages } from '../../utils/constants/messages.const';
import { SocialType } from '../../user/interfaces/user.interface';

export class PostParams {
  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsMongoId({ message: messages.validator.IS_MONGO_ID })
  pid: string;

}

export class ReplyPostParams extends PostParams {
  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsMongoId({ message: messages.validator.IS_MONGO_ID })
  sid: string;
}
