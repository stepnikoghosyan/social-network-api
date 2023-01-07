import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManageFriendshipDto {
  @IsNumber()
  @ApiProperty()
  userId: number;
}
