import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  subtitle: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
