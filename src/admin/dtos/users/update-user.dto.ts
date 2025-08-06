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

export class UpdateUserDto {
  @ApiProperty({
    example: 'Jane',
    description: 'Updated first name (3-50 characters)',
    minLength: 3,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    example: 'Smith',
    description: 'Updated last name (3-50 characters)',
    minLength: 3,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({
    example: 'jane.smith@example.com',
    description: 'Updated email (valid format)',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'Paris, France',
    description: 'Updated location (3-50 characters)',
    minLength: 3,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  location?: string;

  @ApiProperty({
    example: 'https://example.com/resumes/jane-smith.pdf',
    description: 'Updated resume URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Updated role (defaults to current role if not provided)',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}