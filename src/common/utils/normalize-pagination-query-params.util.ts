import { PaginationQueryParams } from '@common/models/pagination-query-params.model';

export function normalizePaginationQueryParams(params: PaginationQueryParams): { skip?: number; take?: number } {
  if (!!params.showAll && (params.showAll === 'true' || +params.showAll === 1)) {
    return {};
  }

  const page = +params.page && +params.page >= 1 ? Math.round(+params.page) : 1;
  const pageSize = +params.pageSize && +params.pageSize >= 1 ? Math.round(+params.pageSize) : 30;

  const skip = (page - 1) * pageSize;

  return { skip, take: pageSize };
}
