import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailValidityCheckDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}
