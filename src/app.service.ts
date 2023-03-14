import {
  QueryDslQueryContainer,
  QueryDslRangeQuery,
  SearchRequest,
  SearchTotalHits,
} from '@elastic/elasticsearch/lib/api/types';
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as crypto from 'crypto';
import { DEFAULT_SORT, PAGING_ITEMS_PER_PAGE } from './config';
import { Comment } from './types';

const rowsPerSearch = parseInt(PAGING_ITEMS_PER_PAGE);

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async saveComments(comments: Comment[]) {
    const result = { total: comments.length };

    for (const {
      text,
      articleLink,
      articleTitle,
      publicationDate,
      source,
    } of comments) {
      try {
        const document = {
          text,
          articleLink,
          articleTitle,
          publicationDate,
          source,
        };

        const response = await this.elasticsearchService.index({
          index: 'comments',
          id: crypto
            .createHash('md5')
            .update(`${text}${articleLink}`)
            .digest('hex'),
          document,
        });

        result[response.result] =
          result[response.result] === undefined
            ? 1
            : result[response.result] + 1;
      } catch (e) {
        this.logger.error(e);
      }
    }

    return result;
  }

  async getComments(
    query = '',
    source: string,
    sort = DEFAULT_SORT,
    page,
    publicationDateRange?: { from: string; to: string },
  ): Promise<{
    result: Comment[];
    loadMoreActive: boolean;
    total?: number;
    perPage?: number;
  }> {
    const getTotalExact = page !== undefined;

    const params: SearchRequest = {
      index: 'comments',
      sort: { publicationDate: sort },
      size: rowsPerSearch,
      from: (page || 0) * rowsPerSearch,
      track_total_hits: getTotalExact ? true : rowsPerSearch,
      query: {
        bool: {
          must: [],
        },
      },
    };

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

    if (query) {
      (params.query.bool.must as QueryDslQueryContainer[]).push({
        span_near: {
          clauses,
          slop: 12,
          in_order: false,
        },
      });
    } else {
      (params.query.bool.must as QueryDslQueryContainer[]).push({
        match_all: {},
      });
    }

    if (publicationDateRange) {
      const rangeQuery: QueryDslRangeQuery = {};

      if (publicationDateRange.from) rangeQuery.gte = publicationDateRange.from;
      if (publicationDateRange.to) rangeQuery.lte = publicationDateRange.to;

      (params.query.bool.must as QueryDslQueryContainer[]).push({
        range: {
          publicationDate: rangeQuery,
        },
      });
    }

    if (source) {
      (params.query.bool.must as QueryDslQueryContainer[]).push({
        match: {
          source: {
            query: source,
          },
        },
      });
    }

    this.logger.debug(`Elasticsearch params ${JSON.stringify(params)}`);

    let result;

    try {
      result = await this.elasticsearchService.search<Comment>(params);
    } catch (e) {
      this.logger.error(e);

      return {
        result: [],
        loadMoreActive: false,
      };
    }

    const comments = result.hits.hits.map((item) => item._source);

    const response: Awaited<ReturnType<AppService['getComments']>> = {
      result: comments,
      loadMoreActive: (result.hits.total as SearchTotalHits).relation === 'gte',
    };

    if (getTotalExact) {
      response.total = (result.hits.total as SearchTotalHits).value;
      response.perPage = rowsPerSearch;
    }

    return response;
  }
}
