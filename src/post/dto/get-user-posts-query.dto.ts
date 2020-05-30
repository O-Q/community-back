import { Type } from 'class-transformer';
import { IsNotEmpty, IsPositive, Min, Max, IsEnum, IsOptional, IsBoolean, IsBooleanString, IsString } from 'class-validator';
import { PostSortBy } from '../enums/sort-post.enum';
import { messages } from '../../../messages.const';

export class UserPostsQuery {

    @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
    @IsString({ message: messages.validator.IS_STRING })
    u: string;

    @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
    @Type(() => Number)
    page: number;

    @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
    @IsPositive({ message: messages.validator.IS_POSITIVE })
    @Type(() => Number)
    @Min(5)
    @Max(100)
    itemsPerPage: number;

    @IsOptional()
    @IsEnum(PostSortBy)
    sortBy: PostSortBy;

    @IsOptional()
    @IsBooleanString({ message: messages.validator.IS_BOOLEAN_STRING })
    isComment: boolean;
}