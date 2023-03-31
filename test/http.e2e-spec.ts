import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CommentsService } from '../src/comments.service';
import { HttpController } from './../src/http.controller';

describe('HttpController (e2e)', () => {
  let app: INestApplication;
  const commentsService = { getComments: () => ['test'] };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HttpController],
      providers: [CommentsService],
    })
      .overrideProvider(CommentsService)
      .useValue(commentsService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/search (GET) Base request', () => {
    return request(app.getHttpServer())
      .get('/search')
      .expect(200)
      .expect(commentsService.getComments());
  });

  it('/search (GET) With correct publication date', () => {
    return request(app.getHttpServer())
      .get(
        '/search?publicationDateFrom=2023-03-15T05%3A00%3A00Z&publicationDateTo=2023-03-16T05%3A00%3A00Z',
      )
      .expect(200)
      .expect(commentsService.getComments());
  });

  it('/search (GET) With correct publication date incorrect range', () => {
    return request(app.getHttpServer())
      .get(
        '/search?publicationDateFrom=2023-03-15T05%3A00%3A00Z&publicationDateTo=2023-03-14T05%3A00%3A00Z',
      )
      .expect(400);
  });

  it('/search (GET) With correct publication date incorrect date', () => {
    return request(app.getHttpServer())
      .get('/search?publicationDateFrom=2023-03-1s5T05%3A00%3A00Z')
      .expect(400);
  });

  it('/search (GET) With correct source', () => {
    return request(app.getHttpServer())
      .get('/search?source=dou')
      .expect(200)
      .expect(commentsService.getComments());
  });

  it('/search (GET) With incorrect source', () => {
    return request(app.getHttpServer())
      .get('/search?source=awdafknl4')
      .expect(400);
  });

  it('/search (GET) With correct sort asc', () => {
    return request(app.getHttpServer())
      .get('/search?sort=asc')
      .expect(200)
      .expect(commentsService.getComments());
  });

  it('/search (GET) With correct sort desc', () => {
    return request(app.getHttpServer())
      .get('/search?sort=desc')
      .expect(200)
      .expect(commentsService.getComments());
  });

  it('/search (GET) With incorrect sort', () => {
    return request(app.getHttpServer())
      .get('/search?sort=awdafknl4')
      .expect(400);
  });

  it('/search (GET) With correct page ', () => {
    return request(app.getHttpServer())
      .get('/search?page=1')
      .expect(200)
      .expect(commentsService.getComments());
  });

  it('/search (GET) With correct page -1', () => {
    return request(app.getHttpServer()).get('/search?page=-1').expect(400);
  });

  it('/search (GET) With correct page string', () => {
    return request(app.getHttpServer()).get('/search?page=wdawd').expect(400);
  });

  it('/search (GET) With correct query', () => {
    return request(app.getHttpServer())
      .get('/search?query=efesf')
      .expect(200)
      .expect(commentsService.getComments());
  });
});
