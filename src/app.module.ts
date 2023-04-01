import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { CommentsService } from './comments.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ELASTICSEARCH_URI, RABBITMQ_URI } from './config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { HttpController } from './http.controller';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      connectionInitOptions: { wait: false },
      exchanges: [
        {
          name: 'comments',
          type: 'direct',
          options: {
            durable: true,
          },
        },
        {
          name: 'comments.dlx',
          type: 'direct',
          options: {
            durable: true,
          },
        },
      ],
      uri: RABBITMQ_URI,
      enableControllerDiscovery: true,
      channels: {
        'comments-publish': {},
        'comments-consume': {},
      },
    }),
    ElasticsearchModule.register({
      node: ELASTICSEARCH_URI,
    }),
  ],
  controllers: [QueueController, HttpController],
  providers: [CommentsService],
})
export class AppModule {}
