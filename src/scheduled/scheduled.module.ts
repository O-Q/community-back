import { Module } from '@nestjs/common';
import { ScheduledService } from './scheduled.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialSchema } from '../social/schemas/social.schema';
import { LoggerModule } from '../logger/logger.module';

@Module({
  providers: [ScheduledService],
  imports: [MongooseModule.forFeature([
    { name: 'Social', schema: SocialSchema },
  ]), LoggerModule],
})
export class ScheduledModule { }
