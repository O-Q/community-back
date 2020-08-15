import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../user/interfaces/user.interface';

@Injectable()
export class PostPrivacyGuard implements CanActivate {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const username = request.query.u;
        const searcher = request.user;
        if (username === searcher?.username) {
            return true;
        }
        const searched = await this.userModel.findOne({ username }, { privacy: 1 }).lean();
        const postPrivacy = searched?.privacy?.posts;
        if (postPrivacy) {
            return this._isPermitted(postPrivacy, searched._id.toHexString(), searcher);
        }
        return true;
    }
    _isPermitted(postPrivacy: string, searchedUid: string, searcher: User) {
        switch (postPrivacy) {
            case 'nobody':
                return false;
            case 'followers':
                const isFollower = searcher?.following?.some(id => id.toHexString() === searchedUid);
                return isFollower ? true : false;
            case 'registered':
                return !searcher ? false : true;
        }
        return true;
    }
}
