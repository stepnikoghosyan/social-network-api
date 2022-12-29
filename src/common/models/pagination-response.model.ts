export interface PaginationResponse<T = unknown> {
  count: number;
  results: Array<T>;
}
