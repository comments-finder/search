import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as crypto from 'crypto';

export interface Comment {
  text: string;
  articleLink: string;
  articleTitle: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async saveComments(comments: Comment[]) {
    for (const { text, articleLink, articleTitle } of comments) {
      await this.elasticsearchService.index({
        index: 'comments',
        id: crypto
          .createHash('md5')
          .update(`${text}${articleLink}`)
          .digest('hex'),
        document: {
          text,
          articleLink,
          articleTitle,
        },
      });
    }
  }

  async getComments(query: string) {
    const words = query.split(' ');

    const clauses = words.map((word) => ({
      span_multi: {
        match: {
          fuzzy: {
            text: {
              value: word,
              fuzziness: 1,
            },
          },
        },
      },
    }));

    const result = await this.elasticsearchService.search({
      index: 'comments',
      query: {
        span_near: {
          clauses,
          slop: 12,
          in_order: false,
        },
      },
    });

    const comments = result.hits.hits.map((item) => item._source);

    return comments;
  }
}
