import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';

// services
import { MessagesService } from './messages.service';

// decorators
import { CurrentUser } from '@common/decorators/current-user.decorator';

// entities
import { User } from '../users/user.entity';

// dto
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

// models
import { PaginationQueryParams } from '@common/models/pagination-query-params.model';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('/:roomId')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiQuery({ name: 'showAll', type: Boolean, required: false })
  get(
    @Param('roomId') roomId: number,
    @Query() queryParams: PaginationQueryParams,
    @CurrentUser() currentUser: Partial<User>,
  ) {
    return this.messagesService.getMessagesList({ roomId, userId: currentUser.id }, queryParams);
  }

  @Post()
  public register(@Body() payload: CreateMessageDto, @CurrentUser() currentUser: Partial<User>) {
    return this.messagesService.createMessage(payload, currentUser.id);
  }

  @Put('/:id')
  @HttpCode(204)
  public updateUser(
    @Param('id') messageId: number,
    @Body() payload: UpdateMessageDto,
    @CurrentUser() currentUser: Partial<User>,
  ) {
    return this.messagesService.updateMessage(messageId, payload, currentUser.id);
  }

  @Delete('/:id')
  @HttpCode(204)
  public delete(@Param('id') messageId: number, @CurrentUser() currentUser: Partial<User>) {
    return this.messagesService.deleteMessage(messageId, currentUser.id);
  }
}
