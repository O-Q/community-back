import { Injectable, LoggerService } from '@nestjs/common';
import { Blog } from '../blog/interfaces/blog.interface';
import { Forum } from '../forum/interfaces/forum.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as schedule from 'node-schedule';
import { AppLogger } from '../logger/logger';
@Injectable()
export class ScheduledService {

    constructor(@InjectModel('Social') private readonly socialModel: Model<Forum | Blog>, private logger: AppLogger,
    ) {
        this.logger.setContext('ScheduledService');
        this.logger.log('Scheduler Initialized...');

        schedule.scheduleJob('0 0 * * *', async () => {
            await this.resetActivityScore();
            this.logger.log('Social activity score has been reset.');
        });
    }

    async resetActivityScore() {
        await this.socialModel.updateMany(undefined, { activityScore: 0 });
    }
}
