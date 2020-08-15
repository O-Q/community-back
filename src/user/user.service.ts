import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import * as jimp from 'jimp';
import { bcryptRound } from '../config/bcrypt.config';
import { File } from 'fastify-multer/lib/interfaces';
import { STATIC_FILE_PATH_FRONT, STATIC_FILE_PATH_BACK } from '../config/static-file-path.config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { isImageFile, getFileFormat, resizeImage } from '../utils/functions/image.func';
import { messages } from '../utils/constants/messages.const';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
  ) { }
  async getUser(user: User): Promise<User> {
    const u = (await user.populate({ path: 'socials.social', select: 'name flairs type' }).execPopulate()).toJSON();
    delete u.password;
    return u;
  }
  async getUserInfo(username: string, user: User) {
    const userInfo = await this.userModel.findOne({ username }, { __v: 0, password: 0, socials: 0, roles: 0 }).lean() as any;
    if (userInfo) {
      this._filterByPrivacy(userInfo, user);
      if (userInfo._id.toHexString() !== user?.id) {
        userInfo.isFollowing = user?.following.some(uid => uid.toHexString() === userInfo._id.toHexString());
      }
      return userInfo;
    } else {
      throw new NotFoundException(`کاربر ${messages.common.NOT_FOUND}`);
    }
  }

  _filterByPrivacy(searched: User, searcher: User) {
    if (searcher?.username === searched.username) {
      return;
    }
    const isFollower = searcher?.following?.some(id => id.toHexString() === searched._id.toHexString());
    if (searched.privacy) {
      for (const key of Object.keys(searched.privacy)) {
        switch (searched.privacy[key]) {
          case 'nobody':
            if (this._isNotProfile) {
              delete searched[key];
            }
            break;
          case 'followers':
            if (!isFollower && this._isNotProfile(key)) {
              delete searched[key];
            }
            break;
          case 'registered':
            if (!searcher && this._isNotProfile(key)) {
              delete searched[key];
            }
            break;
        }
      }
    }
  }

  private _isNotProfile(key: string) {
    if (key === 'profile') {
      throw new ForbiddenException();
    } else {
      return true;
    }
  }

  async followUser(follower: User, username: string) {
    const followed = await this.userModel.findOneAndUpdate({ username }, { $inc: { followersCount: 1 } });
    console.log(followed);

    await follower.updateOne({ $push: { following: followed._id } });
  }
  async unFollowUser(follower: User, username: string) {
    const followed = await this.userModel.findOneAndUpdate({ username }, { $inc: { followersCount: -1 } });
    console.log(followed);

    await follower.updateOne({ $pull: { following: followed._id } });
  }

  async updateUser(user: User, updatedUser: UserDto): Promise<void> {
    // Note: mongo ignores undeclared property.
    if (user.username === updatedUser.username) {
      await user.updateOne(updatedUser).lean();
    } else { // changing username
      throw new ForbiddenException(messages.common.NOT_PERMITTED);
    }
  }
  async updateEmail(user: User, password: string, newEmail: string) {
    if (await this.isValidPassword(password, user.password)) {
      return await user.update({ email: newEmail }).lean();
    } else {
      throw new ForbiddenException(`گذرواژه ${messages.common.NOT_CORRECT}`);
    }
  }
  async updatePassword(user: User, password: string, newPassword: string) {
    if (await this.isValidPassword(password, user.password)) {
      const p = await bcrypt.hash(newPassword, bcryptRound);
      return await user.updateOne({ password: p }).lean();
    } else {
      throw new ForbiddenException(`گذرواژه ${messages.common.NOT_CORRECT}`);
    }
  }

  async getSocials(user: User) {

    const userPopulated = await user.populate({
      path: 'socials.social', select: 'flairs',
    }).execPopulate();
    return userPopulated.socials;

  }


  async updatePrivacy(user: User, privacy) {
    await user.updateOne({ privacy });
  }

  // TODO: make 2 `isValidPassword` method 1 in somewhere.
  async isValidPassword(
    password: string,
    realEncrypted: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, realEncrypted);
  }

  async updateImage(user: User, file: File, imageType: 'banner' | 'avatar') {
    if (isImageFile(file)) {
      const type = getFileFormat(file);
      const address = `${STATIC_FILE_PATH_FRONT}/user/${imageType}/${user.username}.${type}`;
      const sAddress = `${STATIC_FILE_PATH_BACK}/user/${imageType}/${user.username}.${type}`;
      fs.writeFileSync(sAddress, file.buffer);
      if (imageType === 'banner') {
        await resizeImage(sAddress, { width: 600, height: jimp.AUTO });
        await user.updateOne({ banner: address });
      } else {
        await resizeImage(sAddress, { width: 300, height: jimp.AUTO });
        await user.updateOne({ avatar: address });
      }
      return { link: address };
    } else {
      throw new BadRequestException(`MimeType ${messages.common.INVALID}`);
    }
  }
  async removePhoto(user: User, fileType: 'banner' | 'avatar') {
    const regex = new RegExp(`${user.username}*`);
    const path = `${STATIC_FILE_PATH_BACK}/user/${fileType}/`;
    const filename = fs.readdirSync(path)
      .find(f => regex.test(f));

    fs.unlinkSync(path + filename);
    return await user.updateOne({ [fileType]: null });
  }
}
