import { PipeTransform, BadRequestException } from '@nestjs/common';

export class QueryValidationPipe implements PipeTransform {
  transform(query: string) {
    if (query !== undefined && typeof query !== 'string') {
      throw new BadRequestException(`Page "${query}" is not valid`);
    }

    return query;
  }
}
