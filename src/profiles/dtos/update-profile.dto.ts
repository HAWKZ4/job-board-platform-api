import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Updated first name of the user',
    minLength: 3,
    maxLength: 50,
    example: 'John',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Updated last name of the user',
    minLength: 3,
    maxLength: 50,
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Updated email address of the user',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Updated location of the user',
    minLength: 3,
    maxLength: 50,
    example: 'Amsterdam, Netherlands',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  location?: string;
}
