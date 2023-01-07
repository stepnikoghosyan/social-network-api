import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

// entities
import { User } from '../users/user.entity';

// models
import { FriendshipStatus } from './models/friend-status.model';
import { FriendshipAction } from './models/friendship-action.model';

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToOne(() => User)
  @JoinColumn()
  friend: User;

  @OneToOne(() => User)
  @JoinColumn()
  lastActionUser: User;

  @Column({ type: 'tinyint' })
  actionType: FriendshipAction;

  @Column({ type: 'tinyint' })
  friendshipStatus: FriendshipStatus;
}
