import { ApiProperty } from '@nestjs/swagger';

import { MinLength } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty()
  @MinLength(1)
  message: string;
}
