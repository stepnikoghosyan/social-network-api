import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, MinLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @MinLength(1)
  message: string;

  @ApiProperty()
  @IsNumber()
  roomId: number;
}
