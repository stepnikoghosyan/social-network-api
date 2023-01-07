import { PaginationQueryParams } from '@common/models/pagination-query-params.model';
import { FriendshipStatus } from './friend-status.model';

export interface FriendshipQueryParams extends PaginationQueryParams {
  statuses: FriendshipStatus[];
}
