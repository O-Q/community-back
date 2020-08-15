import { IsNotEmpty, IsNumberString, IsOptional, IsEnum } from 'class-validator';
import { messages } from '../../utils/constants/messages.const';
import { PostSortBy } from '../../post/enums/sort-post.enum';

export class SearchHomepageQuery {
    // @IsNumber()
    @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
    @IsNumberString({ message: messages.validator.IS_NUMBER })
    page: string;

    @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
    @IsNumberString({ message: messages.validator.IS_NUMBER })
    itemsPerPage: string;


    @IsOptional()
    @IsEnum(PostSortBy)
    sortBy: PostSortBy;
}