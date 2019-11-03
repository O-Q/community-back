import { IsString, IsNotEmpty } from 'class-validator';

export class RuleSocial {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
