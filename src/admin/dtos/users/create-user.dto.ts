import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/common/enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name (3-50 characters)',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name (3-50 characters)',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    example: 'Berlin, Germany',
    description: 'User location (3-50 characters)',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  location: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email (valid format, max 255 chars)',
    maxLength: 255,
    required: true,
  })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'User password (min 5 characters)',
    minLength: 5,
    required: true,
  })
  @MinLength(5)
  @IsString()
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'User role (defaults to USER if not provided)',
    required: false,
    default: UserRole.USER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;
}
