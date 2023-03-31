import {
  QueryDslQueryContainer,
  QueryDslRangeQuery,
  QueryDslSpanQuery,
  SearchRequest,
  SearchResponse,
  SearchTotalHits,
  SortOrder,
} from '@elastic/elasticsearch/lib/api/types';
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as crypto from 'crypto';
import { DEFAULT_SORT, PAGING_ITEMS_PER_PAGE } from './config';
import { Comment, GetCommentsReturnType } from './types';

const rowsPerSearch = parseInt(PAGING_ITEMS_PER_PAGE);

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  private createSearchParams({
    currentPage,
    sort,
    query,
    publicationDateRange,
    source,
  }: {
    currentPage: number;
    sort: SortOrder;
    query: string;
    publicationDateRange: { from: string; to: string };
    source: string;
  }) {
    const params: SearchRequest = {
      index: 'comments',
      sort: { publicationDate: sort },
      size: rowsPerSearch,
      from: currentPage * rowsPerSearch,
      track_total_hits: (currentPage + 1) * rowsPerSearch,
      query: {
        bool: {
          must: [],
        },
      },
      highlight: {
        fields: { text: {} },
        boundary_scanner: 'word',
        pre_tags: [''],
        post_tags: [''],
      },
    };

    const words = query.split(' ');

    const clauses: QueryDslSpanQuery[] = words.map((word) => ({
      span_multi: {
        match: {
          fuzzy: {
            text: {
              value: word.toLowerCase(),
              fuzziness: 'AUTO:4,7',
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
            query: source.toLowerCase(),
          },
        },
      });
    }

    return params;
  }

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
    page?: number,
    publicationDateRange?: { from: string; to: string },
  ): Promise<GetCommentsReturnType> {
    const currentPage = page || 0;

    const params = this.createSearchParams({
      currentPage,
      sort,
      query,
      publicationDateRange,
      source,
    });

    this.logger.debug(`Elasticsearch params ${JSON.stringify(params)}`);

    let result: SearchResponse<Comment>;

    try {
      result = await this.elasticsearchService.search<Comment>(params);
      this.logger.debug(
        `Elasticsearch result: ${result.hits.hits.length} items`,
      );
    } catch (e) {
      this.logger.error(e.toString());

      return {
        result: [],
        loadMoreActive: false,
      };
    }

    const comments = result.hits.hits.map(({ _source, highlight }) => ({
      ..._source,
      highlight: highlight?.text,
    }));

    const response: GetCommentsReturnType = {
      result: comments,
      loadMoreActive: (result.hits.total as SearchTotalHits).relation === 'gte',
    };

    return response;
  }
}
