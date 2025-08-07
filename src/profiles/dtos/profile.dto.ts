import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProfileDto {
  @ApiProperty({
    description: 'Unique identifier of the profile',
    example: 42,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'First name of the user',
    example: 'Jane',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Location or city of the user',
    example: 'Berlin, Germany',
  })
  @Expose()
  location: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'jane.doe@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Relative URL to the uploaded resume, or null if not uploaded',
    example: '/uploads/resumes/resume-jane.pdf',
    nullable: true,
  })
  @Expose()
  resumeUrl: string | null;

  @ApiProperty({
    description: 'Date when the profile was created',
    example: '2025-08-01T14:23:00.123Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the profile was last updated',
    example: '2025-08-07T09:15:32.456Z',
  })
  @Expose()
  updatedAt: Date;
}
