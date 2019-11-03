import { IsNotEmpty, IsMongoId, IsString } from 'class-validator';

export class MessageChatDto {
    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsMongoId()
    sid: string;

}
