import { PipeTransform, BadRequestException } from '@nestjs/common';

export class PageValidationPipe implements PipeTransform {
  transform(page: string) {
    if (
      page !== undefined &&
      page !== '' &&
      !(
        Number.isInteger(parseInt(page as string)) &&
        parseInt(page as string) >= 0
      )
    ) {
      throw new BadRequestException(`Page "${page}" is not valid`);
    }

    return page;
  }
}
