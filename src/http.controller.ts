import { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CommentsService } from './comments.service';
import { Source } from './types';
import PublicationDateRangeValidationPipe from './pipes/publication-date-range-validation.pipe';
import { SortValidationPipe } from './pipes/sort-validation.pipe';
import { SourceValidationPipe } from './pipes/source-validation.pipe';
import { PageValidationPipe } from './pipes/page-validation.pipe';
import { QueryValidationPipe } from './pipes/query-validation.pipe';

@Controller()
export class HttpController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('search')
  async findAll(
    @Res() response: Response,
    @Query('query', QueryValidationPipe) query,
    @Query('page', PageValidationPipe) page,
    @Query('sort', SortValidationPipe) sort,
    @Query('source', SourceValidationPipe) source,
    @Query(PublicationDateRangeValidationPipe)
    {
      publicationDateFrom,
      publicationDateTo,
    }: {
      publicationDateFrom?: string;
      publicationDateTo?: string;
    },
  ) {
    const comments = await this.commentsService.getComments(
      query as string,
      source as Source,
      (sort || 'desc') as SortOrder,
      parseInt(page as string),
      {
        from: publicationDateFrom as string,
        to: publicationDateTo as string,
      },
    );

    response.json(comments);
  }
}
