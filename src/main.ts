import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as rateLimit from 'fastify-rate-limit';
import * as helmet from 'fastify-helmet';
import * as mongoose from 'mongoose';
import {
  RATE_LIMIT_OPTIONS,
  HELMET_OPTIONS,
} from './utils/constants/security.constant';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  mongoose.set('useCreateIndex', true);
  app.register(helmet, HELMET_OPTIONS);
  app.register(rateLimit, RATE_LIMIT_OPTIONS);
  app.enableCors();
  await app.listen(3000, 'localhost');
}
bootstrap();
