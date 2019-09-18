import { IsNotEmpty, IsMongoId } from 'class-validator';

export class PostParams {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
