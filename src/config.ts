import { SortOrder } from '@elastic/elasticsearch/lib/api/types';

export const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://localhost:5672';
export const ELASTICSEARCH_URI =
  process.env.ELASTICSEARCH_URI || 'http://localhost:9200';
export const DEFAULT_SORT: SortOrder = 'desc';
export const PAGING_ITEMS_PER_PAGE = process.env.PAGING_ITEMS_PER_PAGE || '10';
