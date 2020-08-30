declare const module: any;
import { NestFactory } from '@nestjs/core';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import * as rateLimit from 'fastify-rate-limit';
import * as helmet from 'fastify-helmet';
import * as mongoose from 'mongoose';
import * as multipart from 'fastify-multipart';
import {
  RATE_LIMIT_OPTIONS,
  HELMET_OPTIONS,
  MULTIPART_OPTIONS,
} from './utils/constants/security.constant';
import { AppLogger } from './logger/logger';
import { CONFIG } from './config';
let config: Config | any;
if (process.platform === 'win32') {
  config = CONFIG.dev;
} else {
  config = CONFIG.prod;
}
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(config.FASTIFY_OPTIONS),
    { httpsOptions: config.FASTIFY_OPTIONS?.https },
  );
  mongoose.set('useCreateIndex', true);
  app.register(helmet, HELMET_OPTIONS);
  app.register(rateLimit, RATE_LIMIT_OPTIONS);
  app.register(multipart, MULTIPART_OPTIONS);
  app.useLogger(app.get(AppLogger));
  app.enableCors();
  await app.listen(config.PORT, config.ADDRESS);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

interface Config {
  FASTIFY_OPTIONS: { https: { key: Buffer, cert: Buffer } };
  ADDRESS: string;
  PORT: number;
}
