import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Forum } from '../forum/interfaces/forum.interface';
import { Blog } from '../blog/interfaces/blog.interface';
import { calcSkippedPage } from '../utils/functions/skip-page.func';
import { SocialQuery } from '../social/dto/social-query.dto';
import { DBErrorHandler } from '../utils/error-handlers/db.handler';
import { Post } from '../post/interfaces/post.interface';
import * as moment from 'moment';
import { PostSortBy } from '../post/enums/sort-post.enum';
import { SearchHomepageQuery } from './dto/search-query.dto';
import { User, SocialType } from '../user/interfaces/user.interface';
import clip from 'text-clipper';
import { POST_JOIN_SOCIAL, POST_JOIN_AUTHOR } from '../shared/common-query';
import { AppLogger } from '../logger/logger';

@Injectable()
export class SearchService {
    constructor(
        @InjectModel('Social') private readonly socialModel: Model<Forum | Blog>,
        @InjectModel('Post') private readonly postModel: Model<Post>,
        private logger: AppLogger) {
        this.logger.setContext('SearchService');
    }
    async searchSocial(query: SocialQuery) {

        // default sort is `POPULARITY`.
        // TODO: it must be weighted by multiple things. first text similarity and then sort it
        const skipped = calcSkippedPage(+query.itemsPerPage, +query.page);
        const words = query.text.split(' ', 3).filter(w => w !== '');
        if (words.length === 0 || words[0].length < 2) {
            this.logger.warn(`[Bad Request] invalid Search Input. Value: ${words}`);
            throw new BadRequestException();
        }
        const regex = [];
        for (const word of words) {
            regex.push(new RegExp(word));
        }
        const containAtLeastOneWord = { $in: regex };
        const baseQuery = this.socialModel
            .aggregate().match({
                $and: [
                    {
                        isPrivate: false,
                        $or: [
                            { tags: containAtLeastOneWord },
                            { flairs: containAtLeastOneWord },
                            { name: containAtLeastOneWord },
                            { title: containAtLeastOneWord },
                        ],
                    },
                ],
            })
            .skip(skipped)
            .limit(+query.itemsPerPage)
            .project({ name: 1, title: 1, description: 1, type: 1, flairs: 1 });
        return await baseQuery.exec().catch(DBErrorHandler);
    }
    async getHomepageSocialData(query) {
        const skipItems = { $skip: calcSkippedPage(+query.itemsPerPage, +query.page) };
        const limitItems = { $limit: +query.itemsPerPage };
        const selectItems = { $project: { name: 1, title: 1, updatedAt: 1 } };
        const result = await this.socialModel
            .aggregate().facet(
                {
                    blogs: [{ $match: { type: SocialType.BLOG, isPrivate: false } }, skipItems, limitItems, selectItems],
                    forums: [{ $match: { type: SocialType.FORUM, isPrivate: false } }, skipItems, limitItems, selectItems]
                },
            );
        return result[0];
    }
    async getHomepagePostData(query: SearchHomepageQuery, user: User) {
        const NotPrivate = { $match: { isPrivate: { $not: { $eq: true } } } };
        const skipItems = { $skip: calcSkippedPage(+query.itemsPerPage, +query.page) };
        const limitItems = { $limit: +query.itemsPerPage };
        const removeJunks = user ? { $project: { __v: 0 } } : { $project: { __v: 0, likedBy: 0, dislikedBy: 0 } };
        const result = (await this.postModel
            .aggregate().facet({
                posts: [
                    NotPrivate,
                    ...this._sortPosts(query.sortBy),
                    skipItems,
                    limitItems,
                    ...POST_JOIN_SOCIAL,
                    ...POST_JOIN_AUTHOR,
                    removeJunks,
                ],
                length: [NotPrivate, ...this._sortPosts(query.sortBy), { $count: 'length' }],
            },
            ))[0];

        if (user) {
            result.posts.forEach((p: any) => {
                const liked = p.likedBy.find((id: Types.ObjectId) => id.toHexString() === user?.id) ? true : null ||
                    p.dislikedBy.find((id: Types.ObjectId) => id.toHexString() === user?.id) ? false : null;
                p.liked = liked;
                delete p.likedBy;
                delete p.dislikedBy;
                p.text = clip(p.text, 300, { html: true, breakWords: true, maxLines: 5 });
            });
        }
        result.length = result.length[0].length;
        return result;
    }
    _sortPosts(sortBy: PostSortBy) {
        if (!sortBy || sortBy === PostSortBy.NEWEST) {
            // sort by date
            return [{ $sort: { createdAt: -1 } }];
        } else {
            const startDate = moment()
                .startOf('day')
                .subtract(7, 'days');
            const inSevenDays = { createdAt: { $gte: startDate.toDate() } };

            if (sortBy === PostSortBy.HOT) {
                // sort by views
                return [
                    { $match: inSevenDays },
                    {
                        $addFields: {
                            rating: {
                                $sum: ['$views', { $multiply: ['$reaction', 2] }],
                            },
                        },
                    },
                    { $sort: { rating: -1 } },
                ];
            } else if (sortBy === PostSortBy.TOP) {
                // sort by liked count
                return [
                    { $match: inSevenDays },
                    { $sort: { reaction: -1 } },
                ];
            }
        }
    }
}
