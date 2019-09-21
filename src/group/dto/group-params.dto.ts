import { IsNotEmpty, IsMongoId } from 'class-validator';

export class GroupParams {
  @IsNotEmpty()
  @IsMongoId()
  gid: string;
}
