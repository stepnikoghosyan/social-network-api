import { PaginationQueryParams } from '@common/models/pagination-query-params.model';

export interface UsersQueryParams extends PaginationQueryParams {
  excludeSelf?: boolean | string | number;
  search?: string;
}
