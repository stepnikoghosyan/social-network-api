import { Column, Entity, JoinColumn, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { Attachment } from '@common/modules/attachments/attachment.entity';
import { Room } from '../rooms/room.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  @ApiProperty()
  email: string;

  @Column({ nullable: false })
  @ApiProperty()
  firstName: string;

  @Column({ nullable: false })
  @ApiProperty()
  lastName: string;

  @OneToOne(() => Attachment)
  @JoinColumn()
  attachment: Attachment;

  @Column({ default: null, type: 'datetime', nullable: true, select: false })
  @ApiProperty()
  activatedAt: Date;

  @Column({ nullable: false, select: false })
  @ApiProperty()
  password: string;

  profilePictureUrl?: string;

  @ManyToMany(() => Room, (room) => room.users)
  rooms: Room[];
}
