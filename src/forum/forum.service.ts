import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  User,
  SocialType,
  RegisteredSocial,
} from '../user/interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Forum, RegisteredUser, Widget } from './interfaces/forum.interface';
import { DBErrorHandler } from '../utils/error-handlers/db.handler';
import { SocialDto } from '../social/dto/social.dto';
import { SocialUserRole } from '../user/enums/social-user-role.enum';
import { SocialQuery } from '../social/dto/social-query.dto';
import { SortByForum } from '../social/enums/sort-social.enum';
import { calcSkippedPage } from '../utils/functions/skip-page.func';
import { WidgetNames } from './../shared/widget-list.enum';
import { InfoDto } from '../social/dto/info.dto';
import { STATIC_FILE_PATH_BACK, STATIC_FILE_PATH_FRONT } from '../config/static-file-path.config';
import * as fs from 'fs';
import * as jimp from 'jimp';
import { File } from 'fastify-multer/lib/interfaces';
import { getFileFormat, isImageFile, resizeImage } from '../utils/functions/image.func';
import { SocialUserStatus } from '../user/enums/social-user-status.enum';
import { messages } from '../utils/constants/messages.const';
import { Post } from '../post/interfaces/post.interface';
import { forumWidgetList, isWidgetsValid } from '../utils/constants/widgets.constant';
import { ActivityScore } from '../utils/constants/activity-score.constant';
import { NotificationType } from '../user/enums/notification.enum';

@Injectable()
export class ForumService {
  constructor(
    @InjectModel('Social') private readonly forumModel: Model<Forum>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Post') private readonly postModel: Model<Post>,


  ) { }

  /**
   * get sorted forums
   * @param query only contains `itemsPerPage` and `page`. it can be contained `sortBy`.
   * default sort is `NEWEST`
   */
  async getForums(query: SocialQuery): Promise<Forum[]> {
    const skipped = calcSkippedPage(+query.itemsPerPage, +query.page);
    if (query.sortBy === SortByForum.POPULARITY) {
      // TODO: do something
      // this.forumModel.find().sort()
    } else {
      return await this._getNewestForums(skipped, +query.itemsPerPage);
    }
  }


  async getForumById(forumId: string): Promise<Forum> {
    const forum: Forum = await this.forumModel.findById(forumId).lean();
    if (forum) {
      // TODO maybe need to filter
      return forum;
    } else {
      throw new NotFoundException(`انجمن ${messages.common.NOT_FOUND}`);
    }
  }

  async getForumByName(forumName: string, user: User): Promise<any> {
    const forums = await this.forumModel.aggregate().match({ name: forumName }).project({ __v: 0, posts: 0 })
      .addFields({
        users: {
          $filter: { input: '$users', as: 'user', cond: { $in: ['$$user.role', [SocialUserRole.CREATOR, SocialUserRole.MODERATOR]] } }
        },
      })
      .lookup({ from: 'users', localField: 'users.user', foreignField: '_id', as: 'users' })
      .addFields({ admins: '$users.username' })
      .project({ users: 0 });
    const forum = forums?.[0];

    if (forum) {
      forum.isUserRegistered = user?.socials.some(s => {
        if (s.social.toHexString() === forum._id.toHexString()) {
          forum.role = s.role;
          forum.writeAccess = s.writeAccess;
          forum.status = s.status;
          return true;
        }
        return false;
      }) || false;

      setImmediate(async () => {
        await this.forumModel.findByIdAndUpdate(forum._id, { $inc: { activityScore: ActivityScore.VIEW_SOCIAL } });
        if (forum.isUserRegistered) {
          await user.updateOne({ $set: { 'socials.$[el].notifications': [] } }, { arrayFilters: [{ 'el.social': forum._id }] });
        }
      });
      return forum;
    } else {
      throw new NotFoundException(`انجمن ${messages.common.NOT_FOUND}`);
    }
  }

  async createForum(user: User, forumDto: SocialDto) {
    const createdForum: Forum = await this.forumModel
      .create({
        ...forumDto,
        type: SocialType.FORUM,
        users: [{ user: user._id, role: SocialUserRole.CREATOR }],
        widgets: forumWidgetList,
      })
      .catch(DBErrorHandler);

    user.socials.push({
      social: createdForum._id,
      role: SocialUserRole.CREATOR,
    });

    await user.save().catch(DBErrorHandler);
    return await this.getForumByName(forumDto.name, user);
  }

  async getForumUsers(forum: Forum) {
    forum = await (await forum.populate({ path: 'users.user', select: 'username avatar socials' }).execPopulate()).toJSON();
    return {
      users: forum.users
        .map(x => (
          {
            ...x.user,
            ...(x.user as any).socials.find(s => s.social.toHexString() === forum._id.toHexString()),
            social: undefined,
            socials: undefined,
          }
        )),
    };
  }

  async updateForumUsers(sid: string, user: User, users: any[]) {
    users.forEach(async (u) => {
      const { username, role, writeAccess, status } = u;
      await this.userModel.updateOne({ username, 'socials.social': sid }, {
        'socials.$.role': role,
        'socials.$.status': status,
        'socials.$.writeAccess': writeAccess,
      }).lean();
      setImmediate(async () => {
        const forum = await this.forumModel.findOneAndUpdate({ '_id': sid, 'users.user': user._id }, { $set: { 'users.$.role': role } }).lean();
        const moderators = this._getAllModerators(forum.users, user);
        await this.updateNotifications({
          type: NotificationType.SOCIAL_MANAGEMENT,
          message: `دسترسی کاربران توسط ${user.username} در انجمن ${forum.name}  تغییر یافت`, sid
        }, forum._id, moderators);
      });
    });
    return { result: 'DONE' };
  }

  async removeUser(sid: string, uid: string, user) {
    const deletedUser = await this.userModel.findByIdAndUpdate(uid, { $pull: { socials: { social: Types.ObjectId(sid) } } });
    const forum = await this.forumModel.findByIdAndUpdate(sid,
      {
        $pull: { users: { user: Types.ObjectId(uid) } },
        $inc: { activityScore: ActivityScore.JOIN_LEAVE_USER * -1 },
      });

    setImmediate(async () => {
      await this.updateNotifications({
        type: NotificationType.SOCIAL_MANAGEMENT,
        message: `${deletedUser.username} توسط ${user.username} از انجمن ${forum.name} حذف شد.`,
        sid: forum.id,
      }, sid, this._getAllModerators(forum.users, user));
    });
    return { result: 'DONE' };
  }
  async updateWidgets(user: User, sname: string, widgets: Widget[]) {
    const social = await this.forumModel.findOne({ name: sname });
    const userSocial = user.socials.find(s => s.social.toHexString() === social.id);

    if ([SocialUserRole.CREATOR].includes(userSocial.role) && isWidgetsValid(widgets, SocialType.FORUM)) {
      return await social.updateOne({ widgets });
    } else {
      throw new ForbiddenException(messages.common.NOT_PERMITTED);
    }
  }

  /// ONLY CREATOR
  async updateWidget(user: User, sname: string, widget: Widget) {
    const social = await this.forumModel.findOne({ name: sname });
    const userSocial = user.socials.find(s => s.social.toHexString() === social.id);
    const wIndex = social.widgets.findIndex(w => widget.name === w.name);
    if ([SocialUserRole.CREATOR].includes(userSocial.role)) {
      return await social.updateOne({ [`widgets.${wIndex}`]: widget });
    } else {
      throw new ForbiddenException(messages.common.NOT_PERMITTED);
    }
  }

  async updateInfo(user: User, sname: string, info: InfoDto) {
    const social = await this.forumModel.findOne({ name: sname });
    const userSocial = user.socials.find(s => s.social.toHexString() === social.id);
    if ([SocialUserRole.CREATOR].includes(userSocial.role)) {
      const { title, description, flairs, isPrivate, status, colors } = info;
      return await social.updateOne({ title, flairs, description, isPrivate, status, colors }).lean().then(async () => {
        const moderators = this._getAllModerators(social.users, user);
        await this.updateNotifications({
          type: NotificationType.SOCIAL_MANAGEMENT,
          message: `اطلاعات انجمن ${social.name} توسط ${user.username} تغییر یافت.`,
          sid: social.id,
        }, social._id, moderators);
      });
    } else {
      throw new ForbiddenException(messages.common.NOT_PERMITTED);
    }
  }

  async joinUserToForum(sid: string, user: User): Promise<any> {
    if (this._isUserNotRegistered(user, sid)) { // handle error is inside method
      const registeredForum: RegisteredSocial = {
        social: Types.ObjectId(sid),
        status: SocialUserStatus.ACTIVE,
      };
      const registeredUser: RegisteredUser = {
        user: user._id,
      };
      // $ne is for safety for the cost of performance
      const forum = await this.forumModel
        .findByIdAndUpdate(sid, { $addToSet: { users: registeredUser }, $inc: { activityScore: ActivityScore.JOIN_LEAVE_USER } })
        .where('users.user')
        .ne(user.id);
      user.socials.push(registeredForum);
      await user.save().catch(DBErrorHandler);
      setImmediate(async () => {
        await this.updateNotifications({
          type: NotificationType.SOCIAL_MANAGEMENT, message: `${user.username} به
        انجمن ${forum.name} پیوست.`, sid: forum.id,
        }, sid, this._getAllModerators(forum.users, user));
      })
      return forum;
    }
  }
  async DeleteForum(sid: string) {
    setImmediate(async () => {
      const deletedForum = await this.forumModel
        .findById(sid, { users: 1, posts: 1, name: 1 });
      const uIds = deletedForum.users.map(u => u.user);
      await this.userModel.updateMany({ _id: { $in: uIds } }, { $pull: { socials: { social: deletedForum._id } } });
      await this.removePhoto(deletedForum.name, 'avatar');
      await this.removePhoto(deletedForum.name, 'banner');
      await this.postModel.deleteMany({ social: sid });
      await deletedForum.remove();
    });
  }
  async leaveUserFromForum(sid: string, user: User) {

    // TODO: SPECIAL ACTION FOR LEAVING CREATOR
    const userRole = user.socials.find(s => s.social.toHexString() === sid).role;
    if (userRole === SocialUserRole.CREATOR) {
      throw new ForbiddenException(messages.common.NOT_PERMITTED);
    } else {
      await this.forumModel.findByIdAndUpdate(sid,
        {
          $pull: { users: { user: user._id } },
          $inc: { activityScore: ActivityScore.JOIN_LEAVE_USER * -1 },
        });
      await user.updateOne({ $pull: { socials: { social: Types.ObjectId(sid) } } });
    }
  }
  async getAllWidgetList(): Promise<Widget[]> {
    return forumWidgetList;
  }


  private _getAllModerators(users: any[], user: User): string[] {
    return users
      .filter(m => [SocialUserRole.MODERATOR, SocialUserRole.CREATOR].includes(m.role) && m.user !== user?._id)
      .map(m => m.user);
  }
  // private async _getGroupById(
  //   groupId: string,
  //   option: { lean: boolean } = { lean: true },
  // ): Promise<Group> {
  //   const query = this.groupModel.findById(groupId);
  //   const group: Group = option.lean ? await query.lean() : await query;
  //   if (group) {
  //     return group;
  //   } else {
  //     throw new NotFoundException('Group not found');
  //   }
  // }

  async updateImage(user: User, sname: string, file: File, imageType: 'banner' | 'avatar') {
    const forum = await this.forumModel.findOne({ name: sname });
    if (!forum) {
      throw new NotFoundException(`انجمن ${messages.common.NOT_FOUND}`);
    }
    const userSocial = user.socials.find(s => s.social.toHexString() === forum.id);
    if ([SocialUserRole.CREATOR].includes(userSocial.role)) {
      if (isImageFile(file)) {
        const type = getFileFormat(file);
        const address = `${STATIC_FILE_PATH_FRONT}/forum/${imageType}/${sname}.${type}`;
        const sAddress = `${STATIC_FILE_PATH_BACK}/forum/${imageType}/${sname}.${type}`;
        fs.writeFileSync(sAddress, file.buffer);
        if (imageType === 'banner') {
          await resizeImage(sAddress, { width: jimp.AUTO, height: 225 });
          await forum.updateOne({ banner: address });
        } else { // avatar
          await resizeImage(sAddress, { width: 300, height: jimp.AUTO });
          await forum.updateOne({ avatar: address });
        }
        setImmediate(async () => {
          const t = imageType === 'banner' ? 'بنر' : 'آواتار';
          await this.updateNotifications(
            { type: NotificationType.SOCIAL_MANAGEMENT, message: `${t} انجمن ${sname} توسط ${user.username} بروزرسانی شد.`, sid: forum.id },
            forum._id, this._getAllModerators(forum.users, user));
        })
        return { link: address };
      } else {
        throw new BadRequestException(`MimeType ${messages.common.INVALID}`);
      }
    } else { // user is not creator
      throw new ForbiddenException(messages.common.NOT_PERMITTED);
    }
  }
  async removePhoto(sname: string, fileType: 'banner' | 'avatar') {
    const regex = new RegExp(`${sname}*`);
    const path = `${STATIC_FILE_PATH_BACK}/forum/${fileType}/`;
    const filename = fs.readdirSync(path).find(f => regex.test(f));
    if (filename) {
      fs.unlinkSync(path + filename);
    }
    return await this.forumModel.findOneAndUpdate({ name: sname }, { [fileType]: null });

  }

  private updateNotifications(notification: { type: string, message: string, pid?: string, sid?: string }, sid: string, users: string[]) {
    return this.userModel.updateMany(
      { _id: { $in: users } },
      {
        $push:
        {
          'socials.$[el].notifications': notification,
        },
      },
      { arrayFilters: [{ 'el.social': sid }] },
    );
  }

  private async _getNewestForums(
    skipped: number,
    itemsPerPage: number,
  ): Promise<Forum[]> {
    return this.forumModel
      .find({ isPrivate: false })
      .sort({
        createdAt: -1, // sort by date DESC
      })
      .skip(skipped)
      .limit(itemsPerPage)
      .lean()
      .catch(DBErrorHandler);
  }
  /**
   * Check condition and handle error.
   */
  private _isUserNotRegistered(user: User, socialId: string) {
    if (user.socials.every(s => s.social.toHexString() !== socialId)) {
      return true;
    } else {
      throw new ConflictException(messages.forum.ALREADY_REGISTERED);
    }
  }

  /**
  * Check condition and handle error.
  */
  // private _isUserRegistered(user: User, socialId: string) {
  //   if (user.socials.some(s => s.social.toHexString() === socialId)) {
  //     return true;
  //   } else {
  //     throw new ForbiddenException(messages.forum.NOT_REGISTERED);
  //   }
  // }
}
