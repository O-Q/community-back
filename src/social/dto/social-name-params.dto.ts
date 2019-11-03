import { IsString, IsNotEmpty } from 'class-validator';

export class SocialNameParams {
  @IsNotEmpty()
  @IsString()
  sname: string;
}
