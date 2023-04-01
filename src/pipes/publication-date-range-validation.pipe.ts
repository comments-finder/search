import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export default class PublicationDateRangePipe implements PipeTransform {
  transform(value: any) {
    const { publicationDateFrom, publicationDateTo } = value;

    const fromIsValid =
      publicationDateFrom === '' ||
      publicationDateFrom === undefined ||
      moment(publicationDateFrom, moment.ISO_8601, true).isValid();

    const toIsValid =
      publicationDateTo === '' ||
      publicationDateTo === undefined ||
      moment(publicationDateTo, moment.ISO_8601, true).isValid();

    if (
      !fromIsValid ||
      !toIsValid ||
      (publicationDateFrom &&
        publicationDateTo &&
        publicationDateTo < publicationDateFrom)
    ) {
      throw new BadRequestException(
        `Invalid publication date range: publicationDateFrom=${publicationDateFrom}, publicationDateTo=${publicationDateTo}`,
      );
    }

    return { publicationDateFrom, publicationDateTo };
  }
}
