import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { WidgetNames } from '../shared/widget-list.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, SocialType } from '../user/interfaces/user.interface';
import { SocialDto } from '../social/dto/social.dto';
import { Blog } from './interfaces/blog.interface';
import { SocialUserRole } from '../user/enums/social-user-role.enum';
import { DBErrorHandler } from '../utils/error-handlers/db.handler';
import { STATIC_FILE_PATH_FRONT, STATIC_FILE_PATH_BACK } from '../config/static-file-path.config';
import * as fs from 'fs';
import * as jimp from 'jimp';
import { File } from 'fastify-multer/lib/interfaces';
import { InfoDto } from '../social/dto/info.dto';
import { resizeImage, isImageFile, getFileFormat } from '../utils/functions/image.func';
import { messages } from '../../messages.const';
import { async } from 'rxjs/internal/scheduler/async';
import { Post } from '../post/interfaces/post.interface';
import { DEFAULT_WIDGETS } from '../utils/constants/widgets.constant';

@Injectable()
export class BlogService {
    constructor(
        @InjectModel('Social') private readonly blogModel: Model<Blog>,
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Post') private readonly postModel: Model<Post>,

    ) { }

    async getBlogByName(blogName: string, user: User) {
        const blogs = await this.blogModel.aggregate().match({ name: blogName }).project({ __v: 0, posts: 0 })
            .addFields({
                users: {
                    $filter: { input: '$users', as: 'user', cond: { $in: ['$$user.role', [SocialUserRole.CREATOR, SocialUserRole.MODERATOR]] } }
                },
            })
            .lookup({ from: 'users', localField: 'users.user', foreignField: '_id', as: 'users' })
            .addFields({ admins: '$users.username' })
            .project({ users: 0 });
        const blog = blogs?.[0];

        if (blog) {
            blog.isUserRegistered = user?.socials.some(s => s.social.toHexString() === blog._id.toHexString()) || false;
            setImmediate(async () => { // set notification to 0
                if (blog.isUserRegistered) {
                    await user.updateOne({ $set: { 'socials.$[el].notifications': 0 } }, { arrayFilters: [{ 'el.social': blog._id }] });
                }
            });
            return blog;
        } else {
            throw new NotFoundException(`بلاگ ${messages.common.NOT_FOUND}`);
        }

    }

    async createBlog(user: User, blogDto: SocialDto) {

        const createdBlog: Blog = await this.blogModel
            .create({
                ...blogDto,
                type: SocialType.BLOG,
                users: [{ user: user._id, role: SocialUserRole.CREATOR }],
                widgets: DEFAULT_WIDGETS,
            })
            .catch(DBErrorHandler);

        user.socials.push({
            social: createdBlog._id,
            role: SocialUserRole.CREATOR,
        });

        await user.save().catch(DBErrorHandler);
        return createdBlog._id;
    }
    async deleteBlog(sid: string) {
        setImmediate(async () => {
            const deletedBlog = await this.blogModel.findByIdAndDelete(sid, { projection: { posts: 1, users: 1 } }) as Blog;
            await this.postModel
                .deleteMany({ _id: { $in: deletedBlog.posts } });
            await this.userModel
                .updateMany({ _id: { $in: deletedBlog.users.map(u => u.user) } }, { $pull: { socials: { social: deletedBlog._id } } });
        });
    }
    async updateInfo(user: User, sname: string, info: InfoDto) {
        const social = await this.blogModel.findOne({ name: sname });
        const userSocial = user.socials.find(s => s.social.toHexString() === social.id);
        if ([SocialUserRole.CREATOR].includes(userSocial.role)) {
            const { description, flairs, isPrivate, status, title, colors } = info;
            return await social.updateOne({ title, flairs, description, isPrivate, status, colors });
        } else {
            throw new ForbiddenException(messages.common.NOT_PERMITTED);

        }
    }
    async updateImage(user: User, sname: string, file: File, imageType: 'banner' | 'avatar') {
        const blog = await this.blogModel.findOne({ name: sname });
        if (!blog) {
            throw new NotFoundException(`بلاگ ${messages.common.NOT_FOUND}`);
        }
        const userSocial = user.socials.find(s => s.social.toHexString() === blog.id);
        if ([SocialUserRole.CREATOR].includes(userSocial.role)) {
            if (isImageFile(file)) {
                const type = getFileFormat(file);
                const address = `${STATIC_FILE_PATH_FRONT}/blog/${imageType}/${sname}.${type}`;
                const sAddress = `${STATIC_FILE_PATH_BACK}/blog/${imageType}/${sname}.${type}`;
                fs.writeFileSync(sAddress, file.buffer);
                if (imageType === 'banner') {
                    await resizeImage(sAddress, { width: jimp.AUTO, height: 225 });
                    await blog.updateOne({ banner: address });
                } else { // avatar
                    await resizeImage(sAddress, { width: 300, height: jimp.AUTO });
                    await blog.updateOne({ avatar: address });
                }
                return { link: address };
            } else {
                throw new BadRequestException(`MimeType ${messages.common.INVALID}`);
            }
        } else { // user is not creator
            throw new ForbiddenException(messages.common.NOT_PERMITTED);
        }
    }

    async removePhoto(sname, fileType: 'banner' | 'avatar') {
        const regex = new RegExp(`${sname}*`);
        const path = `${STATIC_FILE_PATH_BACK}/blog/${fileType}/`;
        const filename = fs.readdirSync(path)
            .find(f => regex.test(f));
        fs.unlinkSync(path + filename);
        return await this.blogModel.findOneAndUpdate({ name: sname }, { [fileType]: null });
    }
}
