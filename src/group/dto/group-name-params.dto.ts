import { IsString, IsNotEmpty } from 'class-validator';

export class GroupNameParams {
  @IsNotEmpty()
  @IsString()
  gname: string;
}
