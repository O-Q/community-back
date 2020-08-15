import { IsNotEmpty, IsMongoId } from 'class-validator';
import { messages } from '../../utils/constants/messages.const';

export class SocialParams {
  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsMongoId({ message: messages.validator.IS_MONGO_ID })
  sid: string;
}

// tslint:disable-next-line: max-classes-per-file
export class SocialUserParams extends SocialParams {
  @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
  @IsMongoId({ message: messages.validator.IS_MONGO_ID })
  uid: string;
}
