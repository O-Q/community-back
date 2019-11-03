import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class JoinChatDto {
    @IsMongoId()
    @IsNotEmpty()
    sid: string;
}
