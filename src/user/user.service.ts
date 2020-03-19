import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
  async getUser(user: User): Promise<User> {
    return await user.populate('socials.social', 'name description flairs');
  }

  async updateUser(user: User, updatedUser: UserDto): Promise<void> {
    // Note: mongo ignores undeclared property.
    if (user.username === updatedUser.username) {
      await user.updateOne(updatedUser).lean();
    } else {
      throw new ForbiddenException('changing username not permitted');
    }
  }
  async getSocials(user: User) {
    const userPopulated = await user.populate({
      path: 'socials.social', select: 'name',
    }).execPopulate();
    return userPopulated.socials;

  }
}
