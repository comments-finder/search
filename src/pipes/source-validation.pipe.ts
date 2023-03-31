import { PipeTransform, BadRequestException } from '@nestjs/common';
import { Source } from 'src/types';

export class SourceValidationPipe implements PipeTransform {
  transform(source: Source) {
    if (source !== undefined && source !== 'blind' && source !== 'dou') {
      throw new BadRequestException(`Source "${source}" is not valid`);
    }

    return source;
  }
}
