import { Injectable, NotFoundException } from '@nestjs/common';
import { Room } from './room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationQueryParams } from '@common/models/pagination-query-params.model';
import { PaginationResponse } from '@common/models/pagination-response.model';
import { RoomDto } from './dto/room.dto';
import { User } from '../users/user.entity';
import { normalizePaginationQueryParams } from '@common/utils/normalize-pagination-query-params.util';

@Injectable()
export class RoomsService {
  constructor(@InjectRepository(Room) private readonly roomsRepository: Repository<Room>) {}

  async getRoomById(id: number, userId: number): Promise<Room> {
    // TODO: Refactor this, there should be a better solution

    const room = await this.roomsRepository.findOne({
      where: {
        id,
        users: {
          id: In([userId]),
        },
      },
      relations: {
        users: true,
      },
    });

    if (!room) {
      throw new NotFoundException();
    }

    return this.roomsRepository.findOne({ where: { id }, relations: { users: true } });
  }

  async getRoomsList(queryParams: PaginationQueryParams, userId: number): Promise<PaginationResponse<Room>> {
    // TODO: Refactor this, there should be a better solution

    // Get list of rooms where user is involved
    const userRooms = await this.roomsRepository.find({
      where: {
        users: {
          id: In([userId]),
        },
      },
      relations: {
        users: true,
      },
    });

    // Get all rooms where user is involved AND all users of that group
    const [results, count] = await this.roomsRepository.findAndCount({
      ...normalizePaginationQueryParams(queryParams),
      where: {
        id: In([userRooms.map((item) => item.id)]),
      },
      relations: {
        users: true,
      },
    });

    return {
      count,
      results,
    };
  }

  async createRoom(payload: RoomDto, userId: number) {
    const roomUsersIds = payload.users || [];
    if (!roomUsersIds.includes(userId)) {
      roomUsersIds.push(userId);
    }

    const roomUsers = roomUsersIds.map((id) => {
      const _user = new User();
      _user.id = id;
      return _user;
    });

    await this.roomsRepository.save({
      name: payload.name,
      isPrivate: payload.isPrivate,
      users: roomUsers,
      updatedAt: new Date(),
    });
  }
}
