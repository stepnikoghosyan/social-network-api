import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '../users/user.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  // TODO: implement after having Messages feature
  // @Column()
  // lastMessage: Message;

  @Column({
    type: 'boolean',
    nullable: false,
  })
  isPrivate: boolean;

  @Column({ default: null, type: 'datetime', nullable: false }) // TODO: default value should be new Date()
  @ApiProperty()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable({
    name: 'room_users',
    joinColumn: {
      name: 'room_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  users: User[];
}
