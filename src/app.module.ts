import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {RabbitMQModule} from "@golevelup/nestjs-rabbitmq";
import {RABBITMQ_URI} from "./config";
import {ElasticsearchModule} from "@nestjs/elasticsearch";
import {HttpController} from "./http.controller";

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'comments',
          type: 'direct',
          options: {
            durable: true,
          }
        },
        {
          name: 'comments.dlx',
          type: 'direct',
          options: {
            durable: true,
          }
        },
      ],
      uri: RABBITMQ_URI,
      enableControllerDiscovery: true,
      channels: {
        'comments-publish': {
        },
        'comments-consume': {
        },
      },
    }),
    ElasticsearchModule.register({
      node: 'http://elasticsearch:9200',
    })
  ],
  controllers: [AppController, HttpController],
  providers: [AppService],
})
export class AppModule {}
