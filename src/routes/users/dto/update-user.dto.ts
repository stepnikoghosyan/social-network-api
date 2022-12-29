import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  @ApiPropertyOptional()
  public email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiPropertyOptional()
  public password: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  public firstName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  public lastName: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiPropertyOptional({
    type: 'file',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  profilePicture: any;
}
