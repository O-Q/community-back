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
import { messages } from '../../messages.const';
import { Post } from '../post/interfaces/post.interface';
import { DEFAULT_WIDGETS } from '../utils/constants/widgets.constant';

@Injectable()
export class ForumService {
  constructor(
    @InjectModel('Social') private readonly forumModel: Model<Forum>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('User') private readonly postModel: Model<Post>,


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
      forum.isUserRegistered = user?.socials.some(s => s.social.toHexString() === forum._id.toHexString()) || false;
      setImmediate(async () => {
        if (forum.isUserRegistered) {
          await user.updateOne({ $set: { 'socials.$[el].notifications': 0 } }, { arrayFilters: [{ 'el.social': forum._id }] });
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
        widgets: DEFAULT_WIDGETS,
      })
      .catch(DBErrorHandler);

    user.socials.push({
      social: createdForum._id,
      role: SocialUserRole.CREATOR,
    });

    await user.save().catch(DBErrorHandler);
    return createdForum._id;
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
    // TODO: (maybe needed someday) can send all users after updating 
    users.forEach(async (u) => {
      const { username, role, writeAccess, status } = u;
      await this.userModel.findOneAndUpdate({ username, 'socials.social': sid }, {
        'socials.$.role': role,
        'socials.$.status': status,
        'socials.$.writeAccess': writeAccess,
      });
    });
    return { result: 'DONE' };
  }

  async removeUser(sid: string, uid: string) {
    await this.userModel.findByIdAndUpdate(uid, { $pull: { socials: { social: Types.ObjectId(sid) } } });
    await this.forumModel.findByIdAndUpdate(sid, { $pull: { users: { user: Types.ObjectId(uid) } } });
    return { result: 'DONE' };
  }
  async updateWidgets(user: User, sname: string, widgets: Widget[]) {
    const social = await this.forumModel.findOne({ name: sname });
    const userSocial = user.socials.find(s => s.social.toHexString() === social.id);

    if ([SocialUserRole.CREATOR].includes(userSocial.role)) {
      return await social.updateOne({ widgets });
    } else {
      throw new ForbiddenException(messages.common.NOT_PERMITTED);
    }
  }

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
      return await social.updateOne({ title, flairs, description, isPrivate, status, colors });
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
        .findByIdAndUpdate(sid, { $addToSet: { users: registeredUser } })
        .where('users.user')
        .ne(user.id);
      user.socials.push(registeredForum);
      await user.save().catch(DBErrorHandler);
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
    await this.forumModel.findByIdAndUpdate(sid, { $pull: { users: { user: user._id } } });
    await user.updateOne({ $pull: { socials: { social: sid } } });
  }
  async getAllWidgetList(): Promise<Widget[]> {
    return DEFAULT_WIDGETS;
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
