import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { LogLevel } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: (process.env.LOG_LEVELS
      ? process.env.LOG_LEVELS.split(',')
      : ['error', 'warn']) as LogLevel[],
  });

  await app.listen(process.env.PORT || 3333);
}

process.on('uncaughtException', (err, origin) => {
  console.error(err, origin);
});

bootstrap();
