import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

// entities
import { User } from '../users/user.entity';
import { Message } from '../messages/messages.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'boolean',
    nullable: false,
  })
  isPrivate: boolean;

  @Column({ default: null, type: 'datetime', nullable: false }) // TODO: default value should be new Date()
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

  @OneToOne(() => Message)
  @JoinColumn()
  lastMessage: Message | null;
}
