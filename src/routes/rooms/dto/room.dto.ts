import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

export class RoomDto {
  @ApiProperty()
  @MinLength(3)
  name: string;

  @ApiProperty()
  isPrivate: boolean;

  @ApiPropertyOptional({
    type: Number,
    isArray: true,
  })
  users?: number[];
}
