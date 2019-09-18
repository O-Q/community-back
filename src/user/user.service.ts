import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
  async getUser(user: User): Promise<User> {
    return user
      .populate('groups.group', 'name description tags')
      .execPopulate();
  }

  async updateUser(user: User, updatedUser: UserDto): Promise<void> {
    // Note: mongo ignores undeclared property.
    if (user.username === updatedUser.username) {
      await user.updateOne(updatedUser).lean();
    } else {
      throw new ForbiddenException('changing username not permitted');
    }
  }
  async getGroups(user: User) {
    return user.groups;
  }
}
