import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

// entities
import { User } from '../users/user.entity';
import { Room } from '../rooms/room.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  message: string;

  @Column({ default: null, type: 'datetime', nullable: false }) // TODO: default value should be new Date()
  createdAt: Date;

  @Column({ default: null, type: 'datetime', nullable: false }) // TODO: default value should be new Date()
  updatedAt: Date;

  @ManyToOne(() => Room)
  room: Room;

  @ManyToOne(() => User)
  author: User;
}
