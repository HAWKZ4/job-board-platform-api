import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name (3-50 characters)',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name (3-50 characters)',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email (valid format, max 255 chars)',
    maxLength: 255,
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'User password (min 5 characters)',
    minLength: 5,
    required: true,
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'Berlin, Germany',
    description: 'User location (3-50 characters)',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  location: string;
}
