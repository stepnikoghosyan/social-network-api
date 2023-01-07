import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// modules
import { RoomsModule } from '../rooms/rooms.module';

// services
import { MessagesService } from './messages.service';

// controllers
import { MessagesController } from './messages.controller';

// entities
import { Message } from './messages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), RoomsModule],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [],
})
export class MessagesModule {}
