import { IsString, IsNotEmpty } from 'class-validator';

export class RuleGroup {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
