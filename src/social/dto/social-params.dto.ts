import { IsNotEmpty, IsMongoId } from 'class-validator';

export class SocialParams {
  @IsNotEmpty()
  @IsMongoId()
  sid: string;
}
