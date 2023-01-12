import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// services
import { RoomsService } from '../rooms/rooms.service';

// entities
import { Room } from '../rooms/room.entity';
import { User } from '../users/user.entity';
import { Message } from './messages.entity';

// dto
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

// models
import { PaginationQueryParams } from '@common/models/pagination-query-params.model';
import { PaginationResponse } from '@common/models/pagination-response.model';

// utils
import { normalizePaginationQueryParams } from '@common/utils/normalize-pagination-query-params.util';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private readonly messagesRepository: Repository<Message>,
    private readonly roomsService: RoomsService,
  ) {}

  async getMessagesList(
    options: { roomId: number; userId: number },
    queryParams: PaginationQueryParams,
  ): Promise<PaginationResponse<Message>> {
    // Check if room exists and user is part of the room
    await this.roomsService.getRoomById(options.roomId, options.userId);

    const [results, count] = await this.messagesRepository.findAndCount({
      where: {
        room: {
          id: options.roomId,
        },
      },
      ...normalizePaginationQueryParams(queryParams),
      order: {
        createdAt: 'DESC',
      },
      relations: {
        author: true,
        room: true,
      },
    });

    return {
      results,
      count,
    };
  }

  async createMessage(payload: CreateMessageDto, userId: number): Promise<void> {
    // Check if room exists and user is part of the room
    await this.roomsService.getRoomById(payload.roomId, userId);

    const room = new Room();
    room.id = payload.roomId;

    const author = new User();
    author.id = userId;

    const result = await this.messagesRepository.save({
      message: payload.message,
      room,
      author: author,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.roomsService.updateLastMessage({ roomId: room.id, messageId: result.id, userId: author.id });
  }

  async updateMessage(id: number, payload: UpdateMessageDto, userId: number): Promise<void> {
    const message = await this.messagesRepository.findOneBy({ id, author: { id: userId } });
    if (!message) {
      throw new NotFoundException();
    }

    await this.messagesRepository.update(message.id, {
      message: payload.message || message.message,
      updatedAt: new Date(),
    });
  }

  async deleteMessage(id: number, userId: number): Promise<void> {
    const message = await this.messagesRepository.findOneBy({ id, author: { id: userId } });
    if (!message) {
      throw new NotFoundException();
    }

    await this.messagesRepository.delete(id);
  }
}
