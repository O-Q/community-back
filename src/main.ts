import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors();
  // deprecation warning
  mongoose.set('useCreateIndex', true);
  await app.listen(3000);
}
bootstrap();
