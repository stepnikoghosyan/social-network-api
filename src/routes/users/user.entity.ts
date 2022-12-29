import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: string;

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

  // TODO: implement
  // @Column({ nullable: true })
  // @ForeignKey(() => Attachment)
  // @ApiProperty()
  // profilePictureId: number;

  // TODO: check with TypeORM and implement
  // @BelongsTo(() => Attachment)
  // attachment: Attachment;

  @Column({ default: null, type: 'datetime', nullable: true })
  @ApiProperty()
  activatedAt: Date;

  @Column({ nullable: false, select: false })
  @ApiProperty()
  password: string;
}
