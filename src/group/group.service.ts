import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { User, RegisteredGroup } from '../user/interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, RegisteredUser } from './interfaces/group.interface';
import { DBErrorHandler } from '../utils/error-handlers/db.handler';
import { GroupDto } from './dto/group.dto';
import { GroupUserRole } from '../user/enums/group-user-role.enum';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<Group>,
  ) {}

  async getGroupById(groupId: string): Promise<Group> {
    const group: Group = await this.groupModel.findById(groupId).lean();
    if (group) {
      return group;
    } else {
      throw new NotFoundException('Group not found');
    }
  }

  async CreateGroup(user: User, groupDto: GroupDto) {
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

  async addUserToGroup(groupId: string, user: User): Promise<User> {
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
