import { IsNotEmpty, IsMongoId, IsString } from 'class-validator';

export class PostParams {
  @IsNotEmpty()
  @IsMongoId()
  pid: string;

  @IsNotEmpty()
  @IsString()
  sname: string;
}
