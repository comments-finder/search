import { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import { PipeTransform, BadRequestException } from '@nestjs/common';

export class SortValidationPipe implements PipeTransform {
  transform(sortOrder: SortOrder) {
    if (
      sortOrder !== undefined &&
      sortOrder !== 'asc' &&
      sortOrder !== 'desc'
    ) {
      throw new BadRequestException(
        `Invalid sort order ${sortOrder}. Expected 'asc', 'desc' or undefined`,
      );
    }

    return sortOrder;
  }
}
