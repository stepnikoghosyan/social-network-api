import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  @ApiProperty()
  public newPassword: string;

  @IsString()
  @ApiProperty()
  public token: string;
}
