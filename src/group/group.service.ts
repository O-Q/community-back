import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { User, RegisteredGroup } from '../user/interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, RegisteredUser } from './interfaces/group.interface';
import { DBErrorHandler } from '../utils/error-handlers/db.handler';
import { GroupDto } from './dto/group.dto';
import { GroupUserRole } from '../user/enums/group-user-role.enum';
import { GroupQuery } from './dto/group-query.dto';
import { SortByGroup } from './enums/sort-group.enum';
import { calcSkippedPage } from '../utils/functions/skip-page.func';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<Group>, // @InjectModel('Group') private readonly postModel: Model<Post>,
  ) {}

  /**
   * get sorted groups
   * @param query only contains `itemsPerPage` and `page`. it can be contained `sortBy`.
   * default sort is `NEWEST`
   */
  async getGroups(query: GroupQuery): Promise<Group[]> {
    const skipped = calcSkippedPage(query.itemsPerPage, query.page);
    if (query.sortBy === SortByGroup.POPULARITY) {
      // TODO: do something
      // this.groupModel.find().sort()
    } else {
      return await this._getNewestGroups(skipped, query.itemsPerPage);
    }
  }

  async getSearchedGroups(query: GroupQuery) {
    // default sort is `POPULARITY`.
    // TODO: it must be weighted by multiple things. first text similarity and then sort it
    const skipped = calcSkippedPage(query.itemsPerPage, query.page);
    const words = query.text.split(' ', 3);
    if (words.length === 0) {
      throw new BadRequestException();
    }
    const containAtLeastOneWord = { $in: words };
    const baseQuery = this.groupModel
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
    if (query.sortBy === SortByGroup.NEWEST) {
      return await baseQuery.sort({ createdAt: -1 }).catch(DBErrorHandler);
    } else {
      // TODO
      // default (POPULARITY)
    }
  }

  async getGroupById(groupId: string): Promise<Group> {
    const group: Group = await this.groupModel.findById(groupId).lean();
    if (group) {
      return group;
    } else {
      throw new NotFoundException('Group not found');
    }
  }

  async getGroupByName(groupName: string): Promise<Group> {
    const group: Group = await this.groupModel
      .findOne({ name: groupName })
      .lean();
    if (group) {
      return group;
    } else {
      throw new NotFoundException('Group not found');
    }
  }

  async createGroup(user: User, groupDto: GroupDto) {
    const createdGroup: Group = await this.groupModel
      .create({
        ...groupDto,
        users: [{ user: user._id, role: GroupUserRole.CREATOR }],
      })
      .catch(DBErrorHandler);

    user.groups.push({
      group: createdGroup._id,
      role: GroupUserRole.CREATOR,
    });
    await user.save().catch(DBErrorHandler);
    return createdGroup.toObject({ versionKey: false });
  }

  async joinUserToGroup(groupId: string, user: User): Promise<User> {
    if (this._isUserNotRegistered(user, groupId)) {
      const registeredGroup: RegisteredGroup = {
        group: Types.ObjectId(groupId),
      };
      const registeredUser: RegisteredUser = {
        user: user._id,
      };
      // $ne is for safety for the cost of performance
      const group = await this.groupModel
        .findByIdAndUpdate(groupId, { $addToSet: { users: registeredUser } })
        .where('users.user')
        .ne(user.id)
        .catch(DBErrorHandler);
      user.groups.push(registeredGroup);
      await user.save().catch(DBErrorHandler);
      return group;
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

  private async _getNewestGroups(
    skipped: number,
    itemsPerPage: number,
  ): Promise<Group[]> {
    return this.groupModel
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
  private _isUserNotRegistered(user: User, groupId: string) {
    if (user.groups.every(g => g.group.toHexString() !== groupId)) {
      return true;
    } else {
      throw new ConflictException(
        `${user.username} is already exists in this group`,
      );
    }
  }
}
