import {Injectable, Logger} from '@nestjs/common';
import {ElasticsearchService} from "@nestjs/elasticsearch";
import * as crypto from "crypto";

export interface Comment {
  text: string,
  articleLink: string
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async saveComments(comments: Comment[]) {
    await Promise.all(comments.map(({ text, articleLink }) => {
      return this.elasticsearchService.index({
        index: 'comments',
        id: crypto.createHash('md5').update(`${text}${articleLink}`).digest('hex'),
        document: {
          text,
          articleLink,
        }
      })
    }))
  }
}
