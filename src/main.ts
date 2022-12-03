import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {MicroserviceOptions, RmqOptions, Transport} from "@nestjs/microservices";

const COMMENTS_Q = "comments_queue";
const DLQ = "dlq_queue";

const rmqOptions: RmqOptions = {
    transport: Transport.RMQ,
    options: {
        urls: ['amqp://rabbitmq:5672'],
    },
};

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule
  );
  await app.listen();
}

process.on('uncaughtException', (err, origin) => {
    console.error(err);
});

bootstrap();
