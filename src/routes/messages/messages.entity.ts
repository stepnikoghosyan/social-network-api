import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

// entities
import { User } from '../users/user.entity';
import { Room } from '../rooms/room.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  message: string;

  @Column({ default: null, type: 'datetime', nullable: false }) // TODO: default value should be new Date()
  @ApiProperty()
  createdAt: Date;

  @Column({ default: null, type: 'datetime', nullable: false }) // TODO: default value should be new Date()
  @ApiProperty()
  updatedAt: Date;

  @ManyToOne(() => Room)
  room: Room;

  @ManyToOne(() => User)
  author: User;
}
