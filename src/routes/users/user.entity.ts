import { Column, Entity, JoinColumn, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

// entities
import { Attachment } from '@common/modules/attachments/attachment.entity';
import { Room } from '../rooms/room.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @OneToOne(() => Attachment)
  @JoinColumn()
  attachment: Attachment;

  @Column({ default: null, type: 'datetime', nullable: true, select: false })
  activatedAt: Date;

  @Column({ nullable: false, select: false })
  password: string;

  profilePictureUrl?: string;

  @ManyToMany(() => Room, (room) => room.users)
  rooms: Room[];

  // TODO: add fullName calculated property
}
