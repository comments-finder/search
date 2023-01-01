import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {MicroserviceOptions, RmqOptions, Transport} from "@nestjs/microservices";


async function bootstrap() {
  const app = await NestFactory.create(
      AppModule,
      {
          logger: process.env.NODE_ENV === 'development' ? ['log', 'debug', 'error', 'verbose', 'warn'] : ['error', 'warn'],
      }
  );
  await app.listen(3333);
}

process.on('uncaughtException', (err, origin) => {
    console.error(err);
});

bootstrap();
