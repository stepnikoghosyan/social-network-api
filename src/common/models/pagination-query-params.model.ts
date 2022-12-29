import { QueryParams } from './query-params.model';

export interface PaginationQueryParams extends QueryParams {
  page?: number;
  pageSize?: number;
}
