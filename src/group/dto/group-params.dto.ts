import { IsNotEmpty, IsMongoId } from 'class-validator';

export class GroupParams {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
