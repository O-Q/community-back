import { IsNotEmpty, IsArray } from 'class-validator';
import { Widget } from '../../forum/interfaces/forum.interface';
import { messages } from '../../utils/constants/messages.const';

export class WidgetsDto {
    @IsArray({ message: messages.validator.IS_ARRAY })
    @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
    widgets: Widget[];
}

export class WidgetDto {
    @IsNotEmpty({ message: messages.validator.IS_NOT_EMPTY })
    widget: Widget;
}