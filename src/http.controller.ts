import { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import moment from 'moment';
import { AppService } from './app.service';

@Controller()
export class HttpController {
  constructor(private readonly appService: AppService) {}

  private isPublicationDateRangeValid(
    publicationDateFrom?: string,
    publicationDateTo?: string,
  ) {
    if (
      !publicationDateFrom ||
      !publicationDateTo ||
      isNaN(new Date(publicationDateFrom).getTime()) ||
      isNaN(new Date(publicationDateTo).getTime()) ||
      publicationDateTo < publicationDateFrom
    )
      return false;

    return true;
  }

  @Get('search')
  async findAll(@Req() request: Request, @Res() response: Response) {
    const {
      q: query,
      from,
      sort,
      publicationDateFrom,
      publicationDateTo,
    } = request.query;

    const publicationDateRange = this.isPublicationDateRangeValid(
      publicationDateFrom as string,
      publicationDateTo as string,
    )
      ? [publicationDateFrom, publicationDateTo]
      : null;

    const comments = await this.appService.getComments(
      query && typeof query === 'string' ? (query as string) : undefined,
      sort && (sort === 'asc' || sort === 'desc')
        ? (sort as SortOrder)
        : undefined,
      from && Number.isInteger(parseInt(from as string))
        ? parseInt(from as string)
        : undefined,
      publicationDateRange
    );

    response.json(comments);
  }
}
