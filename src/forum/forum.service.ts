import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  User,
  SocialType,
  RegisteredSocial,
} from '../user/interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Forum, RegisteredUser } from './interfaces/forum.interface';
import { DBErrorHandler } from '../utils/error-handlers/db.handler';
import { SocialDto } from '../social/dto/social.dto';
import { SocialUserRole } from '../user/enums/social-user-role.enum';
import { SocialQuery } from '../social/dto/social-query.dto';
import { SortByForum } from '../social/enums/sort-social.enum';
import { calcSkippedPage } from '../utils/functions/skip-page.func';
import { WidgetNames } from './../shared/widget-list.enum';

@Injectable()
export class ForumService {
  constructor(
    @InjectModel('Social') private readonly forumModel: Model<Forum>,
  ) { }

  /**
   * get sorted forums
   * @param query only contains `itemsPerPage` and `page`. it can be contained `sortBy`.
   * default sort is `NEWEST`
   */
  async getForums(query: SocialQuery): Promise<Forum[]> {
    const skipped = calcSkippedPage(query.itemsPerPage, query.page);
    if (query.sortBy === SortByForum.POPULARITY) {
      // TODO: do something
      // this.forumModel.find().sort()
    } else {
      return await this._getNewestForums(skipped, query.itemsPerPage);
    }
  }

  async getSearchedForums(query: SocialQuery) {
    // default sort is `POPULARITY`.
    // TODO: it must be weighted by multiple things. first text similarity and then sort it
    const skipped = calcSkippedPage(query.itemsPerPage, query.page);
    const words = query.text.split(' ', 3);
    if (words.length === 0) {
      throw new BadRequestException();
    }
    const containAtLeastOneWord = { $in: words };
    const baseQuery = this.forumModel
      .find()
      .and([
        {
          private: false,
          $or: [
            { tags: containAtLeastOneWord },
            { name: containAtLeastOneWord },
          ],
        },
      ])
      .skip(skipped)
      .limit(query.itemsPerPage)
      .lean();
    if (query.sortBy === SortByForum.NEWEST) {
      return await baseQuery.sort({ createdAt: -1 }).catch(DBErrorHandler);
    } else {
      // TODO
      // default (POPULARITY)
    }
  }

  async getForumById(forumId: string): Promise<Forum> {
    const forum: Forum = await this.forumModel.findById(forumId).lean();
    if (forum) {
      // TODO maybe need to filter
      return forum;
    } else {
      throw new NotFoundException('Forum not found');
    }
  }

  async getForumByName(forumName: string): Promise<any> {
    const forum = await this.forumModel.aggregate().match({ name: forumName }).project({ __v: 0, posts: 0 })
      .addFields({
        users: {
          $filter: { input: '$users', as: 'user', cond: { $in: ['$$user.role', [SocialUserRole.CREATOR, SocialUserRole.MODERATOR]] } }
        },
      })
      .lookup({ from: 'users', localField: 'users.user', foreignField: '_id', as: 'users' })
      .addFields({ admins: '$users.username' })
      .project({ users: 0 });
    if (forum) {
      return forum[0];
    } else {
      throw new NotFoundException('Forum not found');
    }
  }

  async createForum(user: User, forumDto: SocialDto) {
    const DEFAULT_WIDGETS = [
      { name: WidgetNames.RULES },
      {
        name: WidgetNames.USER_LIST, inputs: {
          title: 'بهترین کاربران',
          users: [
            { name: 'Mahdi', url: 'https://google.com', value: 50 },
            { name: 'Asghar', url: 'https://yahoo.com', value: 60 },
          ],
        },
      },
      {
        name: WidgetNames.CHAT,
        inputs: {},
      }, {
        name: WidgetNames.FLAIRS,
      },
    ];
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
      socialType: SocialType.FORUM,
      role: SocialUserRole.CREATOR,
      name: createdForum.name,
    });

    await user.save().catch(DBErrorHandler);
    return createdForum.toObject({ versionKey: false });
  }

  async joinUserToForum(socialId: string, user: User): Promise<User> {
    if (this._isUserNotRegistered(user, socialId)) {
      const registeredForum: RegisteredSocial = {
        social: Types.ObjectId(socialId),
        socialType: SocialType.FORUM,
        name: 'TODO'
      };
      const registeredUser: RegisteredUser = {
        user: user._id,
      };
      // $ne is for safety for the cost of performance
      const forum = await this.forumModel
        .findByIdAndUpdate(socialId, { $addToSet: { users: registeredUser } })
        .where('users.user')
        .ne(user.id)
        .catch(DBErrorHandler);
      user.socials.push(registeredForum);
      await user.save().catch(DBErrorHandler);
      return forum;
    }
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

  private async _getNewestForums(
    skipped: number,
    itemsPerPage: number,
  ): Promise<Forum[]> {
    return this.forumModel
      .find({ private: true })
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
      throw new ConflictException(
        `${user.username} is already exists in this forum`,
      );
    }
  }
}
