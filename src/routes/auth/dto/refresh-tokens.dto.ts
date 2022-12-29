import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokensDto {
  @IsString()
  @ApiProperty()
  refreshToken: string;
}
