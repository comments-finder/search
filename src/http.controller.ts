import { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import { Controller, Get, Logger, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as moment from 'moment';
import { AppService } from './app.service';

@Controller()
export class HttpController {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly appService: AppService) {}

  private isPublicationDateRangeValid(
    publicationDateFrom?: string,
    publicationDateTo?: string,
  ) {
    const fromIsValid =
      !publicationDateFrom ||
      moment(publicationDateFrom, 'YYYY-MM-DDTHH:mm:ssZ', true).isValid();

    const toIsValid =
      !publicationDateTo ||
      moment(publicationDateTo, 'YYYY-MM-DDTHH:mm:ssZ', true).isValid();

    if (
      !fromIsValid ||
      !toIsValid ||
      (publicationDateFrom &&
        publicationDateTo &&
        publicationDateTo < publicationDateFrom)
    )
      return false;

    return true;
  }

  @Get('search')
  async findAll(@Req() request: Request, @Res() response: Response) {
    const {
      q: query,
      source,
      page,
      sort,
      publicationDateFrom,
      publicationDateTo,
    } = request.query;

    const publicationDateRangeIsValid = this.isPublicationDateRangeValid(
      publicationDateFrom as string,
      publicationDateTo as string,
    );

    const publicationDateRange = publicationDateRangeIsValid
      ? {
          from: publicationDateFrom as string,
          to: publicationDateTo as string,
        }
      : null;

    if (!publicationDateRangeIsValid)
      this.logger.debug(
        `Publication date range is invalid publicationDateFrom: ${publicationDateFrom} publicationDateTo: ${publicationDateTo}`,
      );

    const comments = await this.appService.getComments(
      query && typeof query === 'string' ? (query as string) : undefined,
      source === 'blind' || source === 'dou' ? source : undefined,
      sort && (sort === 'asc' || sort === 'desc')
        ? (sort as SortOrder)
        : undefined,
      page &&
        Number.isInteger(parseInt(page as string)) &&
        parseInt(page as string) >= 0
        ? parseInt(page as string)
        : undefined,
      publicationDateRange,
    );

    response.json(comments);
  }
}
