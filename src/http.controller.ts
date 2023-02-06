import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class HttpController {
  constructor(private readonly appService: AppService) {}

  @Get('search')
  async findAll(@Req() request: Request, @Res() response: Response) {
    const { q: query } = request.query;

    if (!query || typeof query !== 'string') {
      return response.status(400).end();
    }

    const comments = await this.appService.getComments(query);

    response.json(comments);
  }
}
