import { IsIn, IsNotEmpty } from 'class-validator';
import { messages } from '../../utils/constants/messages.const';

export class ReactionDto {
    @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
    @IsIn(['LIKE', 'DISLIKE'])
    reaction: 'LIKE' | 'DISLIKE';
}
