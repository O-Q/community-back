import { WidgetNames } from '../../shared/widget-list.enum';
import { Widget } from '../../forum/interfaces/forum.interface';
import { SocialType } from '../../user/interfaces/user.interface';

export const DEFAULT_WIDGETS: Widget[] = [
    {
        name: WidgetNames.RULES,
        type: 'all',
        inputs: [{ value: ['قوانین کلی شبکه اجتماعات ایران را رعایت کنید.'], type: 'inputList', title: 'قانون' }],
        viewValue: 'قوانین', registeredToShow: false,
    },
    {
        name: WidgetNames.USER_LIST,
        type: 'all',
        inputs: [{
            value: [
                { name: 'Mahdi', url: 'https://google.com', value: 50 },
                { name: 'Asghar', url: 'https://yahoo.com', value: 60 },
            ], title: 'کاربر', type: 'inputList',
        }],
        viewValue: 'بهترین کاربران', registeredToShow: true,
    },
    {
        name: WidgetNames.CHAT,
        type: 'forum',
        viewValue: 'چت',
        registeredToShow: true,
    },
    {
        name: WidgetNames.FLAIRS,
        type: 'forum',
        viewValue: 'موضوعات',
        registeredToShow: false,
    },
];

export const forumWidgetList = DEFAULT_WIDGETS.filter(w => w.type !== 'blog');
export const forumWidgetNames = forumWidgetList.map(x => x.name);

export const blogWidgetList = DEFAULT_WIDGETS.filter(w => w.type !== 'forum');
export const blogWidgetNames = blogWidgetList.map(x => x.name);

export function isWidgetsValid(widgets: Widget[], socialType: SocialType) {
    if (socialType === SocialType.FORUM) {
        return widgets.every(w => forumWidgetNames.includes(w.name));
    } else {
        return widgets.every(w => blogWidgetNames.includes(w.name));
    }

}