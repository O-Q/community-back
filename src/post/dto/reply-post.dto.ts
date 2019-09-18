import { IsString, MinLength, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateReplyPostDto {
  @IsString()
  @MinLength(20)
  text: string;

  @IsNotEmpty()
  @IsMongoId()
  replyTo: string;
}
