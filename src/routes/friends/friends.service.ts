import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { In, Repository } from 'typeorm';

// services
import { normalizeUser, UsersService } from '../users/users.service';

// entities
import { Friend } from './friend.entity';
import { User } from '../users/user.entity';

// dto
import { ManageFriendshipDto } from './dto/manage-friendship.dto';

// models
import { FriendshipAction } from './models/friendship-action.model';
import { FriendshipStatus } from './models/friend-status.model';
import { FriendshipQueryParams } from './models/friendship-query-params.model';

// utils
import { normalizePaginationQueryParams } from '@common/utils/normalize-pagination-query-params.util';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend) private readonly friendsRepository: Repository<Friend>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async getFriendshipById(id: number) {
    const friendship = await this.friendsRepository.findOneBy({ id });
    if (!friendship) {
      throw new NotFoundException();
    }

    return friendship;
  }

  async getFriendshipList(queryParams: FriendshipQueryParams, currentUserId: number) {
    return await this.friendsRepository
      .findAndCount({
        where: [
          { friendshipStatus: In(queryParams.statuses), user: { id: currentUserId } },
          { friendshipStatus: In(queryParams.statuses), friend: { id: currentUserId } },
        ],
        ...normalizePaginationQueryParams(queryParams),
        relations: {
          user: true,
          friend: true,
          lastActionUser: true,
        },
      })
      .then(([results, count]) => ({
        count,
        results: normalizeFriendshipList(currentUserId, this.configService, results),
      }));
  }

  // Send Friend Request
  async createFriendRequest(data: { currentUserId: number; payload: ManageFriendshipDto }) {
    if (data.currentUserId === data.payload.userId) {
      throw new UnprocessableEntityException();
    }

    // Current user is already resolved by auth
    const friendUser = await this.usersService.getUserByID(data.payload.userId);
    if (!friendUser) {
      throw new NotFoundException();
    }

    const friendshipAlreadyExists = await this.friendsRepository.findOne({
      where: [
        { user: { id: data.currentUserId }, friend: friendUser },
        { user: friendUser, friend: { id: data.currentUserId } },
      ],
    });
    if (friendshipAlreadyExists) {
      throw new BadRequestException();
    }

    const currentUser = new User();
    currentUser.id = data.currentUserId;

    return this.friendsRepository.save({
      user: currentUser,
      friend: friendUser,
      actionType: FriendshipAction.SEND_FRIENDSHIP_REQUEST,
      friendshipStatus: FriendshipStatus.PENDING,
      lastActionUser: currentUser,
    });
  }

  async updateFriendship(data: { friendshipId: number; currentUserId: number; action: FriendshipAction }) {
    const friendship = await this.getFriendshipById(data.friendshipId);

    friendship.actionType = data.action;
    friendship.lastActionUser = new User();
    friendship.lastActionUser.id = data.currentUserId;

    let friendshipStatus: FriendshipStatus;

    switch (friendship.actionType) {
      case FriendshipAction.SEND_FRIENDSHIP_REQUEST:
        friendshipStatus = FriendshipStatus.PENDING;
        break;
      case FriendshipAction.ACCEPT_FRIENDSHIP_REQUEST:
        friendshipStatus = FriendshipStatus.ACCEPTED;
        break;
      case FriendshipAction.REJECT_FRIENDSHIP_REQUEST:
        friendshipStatus = FriendshipStatus.REJECTED;
        break;
      case FriendshipAction.BLOCK_USER:
        friendshipStatus = FriendshipStatus.BLOCKED;
        break;
    }

    friendship.friendshipStatus = friendshipStatus;

    await this.friendsRepository.update(friendship.id, friendship);
  }

  async blockUser(currentUserId: number, payload: ManageFriendshipDto) {
    // TODO: implement
  }

  async deleteFriendship(id: number, currentUserId: number) {
    // TODO: allow deleting only for relations where current user is one of the users
    const friendship = await this.friendsRepository.findOneBy({ id });
    if (!friendship) {
      throw new NotFoundException();
    }

    await this.friendsRepository.delete(id);
  }
}

function normalizeFriendshipList(
  currentUserId: number,
  configService: ConfigService,
  friendshipList: Friend[],
): Array<Omit<Friend, 'user'>> {
  return friendshipList.map((friendship) => ({
    id: friendship.id,
    friend: normalizeUser(
      friendship.friend.id === currentUserId ? friendship.user : friendship.friend,
      configService,
    ) as any,
    lastActionUser: normalizeUser(friendship.lastActionUser, configService) as any,
    actionType: friendship.actionType,
    friendshipStatus: friendship.friendshipStatus,
  }));
}
