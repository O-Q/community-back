import { Injectable } from '@nestjs/common';
import { Blog } from '../blog/interfaces/blog.interface';
import { Forum } from '../forum/interfaces/forum.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AppLogger } from '../logger/logger';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class ScheduledService {
    constructor(@InjectModel('Social') private readonly socialModel: Model<Forum | Blog>, private logger: AppLogger,
    ) {
        this.logger.setContext(ScheduledService.name);
        this.logger.log('Scheduler Initialized...');
    }

    @Cron('0 0 * * *')
    async resetActivityScore() {
        await this.socialModel.updateMany(undefined, { activityScore: 0 });
        this.logger.log('Social activity score has been reset.');
    }
}
