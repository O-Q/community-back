import { WidgetNames } from '../../shared/widget-list.enum';
import { Widget } from '../../forum/interfaces/forum.interface';

export const DEFAULT_WIDGETS: Widget[] = [
    {
        name: WidgetNames.RULES,
        inputs: [{ value: ['قوانین کلی شبکه اجتماعات ایران را رعایت کنید.'], type: 'inputList', title: 'قانون' }],
        viewValue: 'قوانین', registeredToShow: false,
    },
    {
        name: WidgetNames.USER_LIST, inputs: [{
            value: [
                { name: 'Mahdi', url: 'https://google.com', value: 50 },
                { name: 'Asghar', url: 'https://yahoo.com', value: 60 },
            ], title: 'کاربر', type: 'inputList'
        }],
        viewValue: 'بهترین کاربران', registeredToShow: true,
    },
    {
        name: WidgetNames.CHAT,
        viewValue: 'چت',
        registeredToShow: true,
    },
    {
        name: WidgetNames.FLAIRS,
        viewValue: 'موضوعات',
        registeredToShow: false,
    },
];