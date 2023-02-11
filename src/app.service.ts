import {
  integer,
  SearchRequest,
  SearchTotalHits,
  SortOrder,
} from '@elastic/elasticsearch/lib/api/types';
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as crypto from 'crypto';
import { ROWS_PER_SEARCH } from './config';

export interface Comment {
  text: string;
  articleLink: string;
  articleTitle: string;
  publicationDate: Date;
}

const rowsPerSearch = parseInt(ROWS_PER_SEARCH);

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async saveComments(comments: Comment[]) {
    for (const {
      text,
      articleLink,
      articleTitle,
      publicationDate,
    } of comments) {
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
          publicationDate,
        },
      });
    }
  }

  async getComments(query = '', sort: SortOrder = 'desc', from: integer = 0) {
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

    const params: SearchRequest = {
      index: 'comments',
      sort: { publicationDate: sort },
      size: rowsPerSearch,
      from,
      track_total_hits: rowsPerSearch,
    };

    if (query) {
      params.query = {
        span_near: {
          clauses,
          slop: 12,
          in_order: false,
        },
      };
    } else {
      params.query = {
        match_all: {},
      };
    }

    const result = await this.elasticsearchService.search(params);

    const comments = result.hits.hits.map((item) => item._source);

    return {
      result: comments,
      loadMoreActive: (result.hits.total as SearchTotalHits).relation === 'gte',
    };
  }
}
