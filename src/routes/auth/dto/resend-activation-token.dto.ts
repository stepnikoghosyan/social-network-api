import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendActivationTokenDto {
  @IsEmail()
  @ApiProperty()
  public email: string;
}
