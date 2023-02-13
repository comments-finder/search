import { SortOrder } from '@elastic/elasticsearch/lib/api/types';

export const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://localhost:5672';
export const ROWS_PER_SEARCH = process.env.ROWS_PER_SEARCH || '5';
export const DEFAULT_SORT: SortOrder = 'desc';
