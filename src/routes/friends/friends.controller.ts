import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';

// services
import { FriendsService } from './friends.service';

// entities
import { User } from '../users/user.entity';

// custom decorators
import { CurrentUser } from '@common/decorators/current-user.decorator';

// dto
import { ManageFriendshipDto } from './dto/manage-friendship.dto';

// models
import { FriendshipQueryParams } from './models/friendship-query-params.model';
import { FriendshipStatus } from './models/friend-status.model';
import { FriendshipAction } from './models/friendship-action.model';

@ApiTags('friends')
@ApiBearerAuth()
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendshipService: FriendsService) {}

  @Get('pending-friend-requests')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiQuery({ name: 'showAll', type: Boolean, required: false })
  getPendingFriendRequests(@Query() queryParams: FriendshipQueryParams, @CurrentUser() currentUser: Partial<User>) {
    return this.friendshipService.getFriendshipList(
      { ...queryParams, statuses: [FriendshipStatus.PENDING] },
      currentUser.id,
    );
  }

  @Get('friends-list')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiQuery({ name: 'showAll', type: Boolean, required: false })
  getFriendsList(@Query() queryParams: FriendshipQueryParams, @CurrentUser() currentUser: Partial<User>) {
    return this.friendshipService.getFriendshipList(
      { ...queryParams, statuses: [FriendshipStatus.ACCEPTED] },
      currentUser.id,
    );
  }

  @Get('blocked-users')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiQuery({ name: 'showAll', type: Boolean, required: false })
  get(@Query() queryParams: FriendshipQueryParams, @CurrentUser() currentUser: Partial<User>) {
    return this.friendshipService.getFriendshipList(
      { ...queryParams, statuses: [FriendshipStatus.BLOCKED] },
      currentUser.id,
    );
  }

  // @Post('')
  // public register(@Body() payload: AddFriendDto, @CurrentUser() currentUser: Partial<User>) {
  //   return this.friendshipService.createFriendRequest({ currentUserId: currentUser.id, payload });
  // }

  @Post('send-friendship-request')
  @HttpCode(204)
  public sendFriendshipRequest(@Body() payload: ManageFriendshipDto, @CurrentUser() currentUser: Partial<User>) {
    return this.friendshipService.createFriendRequest({ currentUserId: currentUser.id, payload });
  }

  @Put('accept-friendship-request/:id')
  @HttpCode(204)
  public acceptFriendshipRequest(@Param('id') friendshipRequestId: number, @CurrentUser() currentUser: Partial<User>) {
    return this.friendshipService.updateFriendship({
      friendshipId: friendshipRequestId,
      currentUserId: currentUser.id,
      action: FriendshipAction.ACCEPT_FRIENDSHIP_REQUEST,
    });
  }

  @Put('reject-friendship-request/:id')
  @HttpCode(204)
  public rejectFriendshipRequest(
    @Param('id') friendshipRequestId: number,
    @Body() payload: ManageFriendshipDto,
    @CurrentUser() currentUser: Partial<User>,
  ) {
    return this.friendshipService.updateFriendship({
      friendshipId: friendshipRequestId,
      currentUserId: currentUser.id,
      action: FriendshipAction.REJECT_FRIENDSHIP_REQUEST,
    });
  }

  @Put('block-user')
  @HttpCode(204)
  public blockUser(@Body() payload: ManageFriendshipDto, @CurrentUser() currentUser: Partial<User>) {
    // TODO: implement
    return this.friendshipService.blockUser(currentUser.id, payload);
  }

  @Put('unblock-user/:id')
  @HttpCode(204)
  public unblockUser(
    @Param('id') friendshipRequestId: number,
    @Body() payload: ManageFriendshipDto,
    @CurrentUser() currentUser: Partial<User>,
  ) {
    return this.friendshipService.updateFriendship({
      // TODO: implement
      // What should user be after unblocking ? remove friendship or set ACCEPTED or REJECTED ? or keep previous state in db ?
      friendshipId: friendshipRequestId,
      currentUserId: currentUser.id,
      action: FriendshipAction.UNBLOCK_USER,
    });
  }

  @Delete('/:id')
  @HttpCode(204)
  public delete(@Param('id') friendshipId: number, @CurrentUser() currentUser: Partial<User>) {
    return this.friendshipService.deleteFriendship(friendshipId, currentUser.id);
  }
}
