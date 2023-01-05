import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

// services
import { RoomsService } from './rooms.service';

// entities
import { User } from '../users/user.entity';

// dto
import { RoomDto } from './dto/room.dto';

// models
import { PaginationQueryParams } from '@common/models/pagination-query-params.model';

// decorators
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiQuery({ name: 'showAll', type: Boolean, required: false })
  get(@Query() queryParams: PaginationQueryParams, @CurrentUser() currentUser: Partial<User>) {
    return this.roomsService.getRoomsList(queryParams, currentUser.id);
  }

  @Get('/:id')
  getByID(@Param('id') roomId: number, @CurrentUser() currentUser: Partial<User>) {
    return this.roomsService.getRoomById(roomId, currentUser.id);
  }

  @Post('')
  public register(@Body() payload: RoomDto, @CurrentUser() currentUser: Partial<User>) {
    return this.roomsService.createRoom(payload, currentUser.id);
  }
}
