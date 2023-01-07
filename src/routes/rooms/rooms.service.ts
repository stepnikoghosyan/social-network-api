import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

// entities
import { Room } from './room.entity';
import { User } from '../users/user.entity';
import { Message } from '../messages/messages.entity';

// dto
import { RoomDto } from './dto/room.dto';

// models
import { PaginationQueryParams } from '@common/models/pagination-query-params.model';
import { PaginationResponse } from '@common/models/pagination-response.model';

// utils
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

    return this.roomsRepository.findOne({
      where: { id },
      relations: {
        users: true,
        lastMessage: {
          author: true,
          room: true,
        },
      },
    });
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

    if (!userRooms || !userRooms.length) {
      return {
        count: 0,
        results: [],
      };
    }

    // Get all rooms where user is involved AND all users of that group
    const [results, count] = await this.roomsRepository.findAndCount({
      ...normalizePaginationQueryParams(queryParams),
      where: {
        id: In([userRooms.map((item) => item.id)]),
      },
      relations: {
        users: true,
        lastMessage: {
          author: true,
          room: true,
        },
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

  async updateLastMessage(data: { roomId: number; messageId: number; userId: number }): Promise<void> {
    const room = await this.getRoomById(data.roomId, data.userId);

    const message = new Message();
    message.id = data.messageId;

    await this.roomsRepository.update(room.id, { lastMessage: { id: data.messageId } });
  }
}
