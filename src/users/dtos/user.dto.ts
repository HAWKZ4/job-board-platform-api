import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';

// Full user response
export class UserDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the user',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
    required: true,
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
    required: true,
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    example: 'New York, USA',
    description: 'User location (city/country)',
    required: false,
  })
  @Expose()
  location: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address (unique)',
    required: true,
  })
  @Expose()
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'User role (e.g., user, admin)',
  })
  @Expose()
  role: UserRole; // Use the enum type, not string

  @ApiProperty({
    example: 'https://example.com/resumes/john-doe.pdf',
    description: 'URL to the user resume (admin-only)',
    required: false,
    nullable: true,
  })
  @Expose() // Only expose to admins
  resumeUrl?: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp when user was created',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-02T00:00:00.000Z',
    description: 'Timestamp when user was last updated',
  })
  @Expose()
  updatedAt: Date;
}
