import { IsNotEmpty, IsMongoId } from 'class-validator';

export class PostParams {
  @IsNotEmpty()
  @IsMongoId()
  pid: string;

  @IsNotEmpty()
  @IsMongoId()
  sid: string;
}
