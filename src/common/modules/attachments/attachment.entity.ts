import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  fileName: string;
}
