import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Comment } from './types';
import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @RabbitRPC({
    exchange: 'comments',
    routingKey: 'new-comments',
    queue: 'comments',
    queueOptions: {
      channel: 'comments-consume',
      durable: true,
      deadLetterExchange: 'comments.dlx',
      deadLetterRoutingKey: 'new-comments-dlq',
      messageTtl: 10000,
    },
  })
  public async newComments(data: string) {
    try {
      const comments = (JSON.parse(data) as Comment[]).map<Comment>(
        ({ text, articleLink, articleTitle, publicationDate, source }) => ({
          text,
          articleLink,
          articleTitle,
          publicationDate,
          source,
        }),
      );

      const result = await this.appService.saveComments(comments);

      this.logger.log(
        `Message "new-comments" handled successfully. Result: ${JSON.stringify(
          result,
        )}`,
      );

      return 'Message delivered';
    } catch (e) {
      this.logger.error(`Failed to handle "new-comments" message`);
      this.logger.error(e, e.stack);
      return new Nack();
    }
  }

  @RabbitRPC({
    exchange: 'comments.dlx',
    routingKey: 'new-comments-dlq',
    queue: 'comments.dlq',
    queueOptions: {
      channel: 'comments-consume',
      durable: true,
    },
  })
  public async newCommentsDlq() {
    try {
      this.logger.log(`Message "new-comments-dlq" handled successfully`);
      return 'Message delivered in DLQ';
    } catch (e) {
      this.logger.error(`Failed to handle "new-comments-dlq" message`);
      this.logger.error(e, e.stack);
      return new Nack();
    }
  }
}
