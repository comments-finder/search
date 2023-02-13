import { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class HttpController {
  constructor(private readonly appService: AppService) {}

  @Get('search')
  async findAll(@Req() request: Request, @Res() response: Response) {
    const { q: query, from, sort } = request.query;

    const comments = await this.appService.getComments(
      query && typeof query === 'string' ? (query as string) : undefined,
      sort && (sort === 'asc' || sort === 'desc')
        ? (sort as SortOrder)
        : undefined,
      from && Number.isInteger(parseInt(from as string))
        ? parseInt(from as string)
        : undefined,
    );

    response.json(comments);
  }
}
