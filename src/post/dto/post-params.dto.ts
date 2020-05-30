import { IsNotEmpty, IsMongoId, IsString } from 'class-validator';
import { messages } from '../../../messages.const';

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
