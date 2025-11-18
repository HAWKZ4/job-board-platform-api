import { Expose, Type } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ApplicationStatus } from '../../../applications/enums/application-status.enum';
import { ApiProperty } from '@nestjs/swagger';

@Expose()
export class AdminUserInfo {
  @ApiProperty({ example: 42, description: 'Unique identifier of the user' })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @Expose()
  email: string;

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @Expose()
  lastName: string;

  @ApiProperty({
    example: 'https://example.com/resume.pdf',
    description: 'Link to the uploaded resume',
  })
  @Expose()
  resumeUrl: string | null;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Role of the user',
  })
  @Expose()
  role: UserRole;
}

@Expose()
export class AdminJobInfo {
  @ApiProperty({ example: 10, description: 'Unique job identifier' })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'Frontend Developer',
    description: 'Title of the job',
  })
  @Expose()
  title: string;

  @ApiProperty({ example: 'TechCorp', description: 'Company offering the job' })
  @Expose()
  company: string;

  @ApiProperty({ example: 'Berlin, Germany', description: 'Job location' })
  @Expose()
  location: string;
}

export class AdminApplicationDto {
  @ApiProperty({ example: 101, description: 'Unique ID of the application' })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'I am excited to apply...',
    description: 'Cover letter provided by the applicant',
  })
  @Expose()
  coverLetter: string;

  @ApiProperty({
    example: '/uploads/resumes/resume-old.pdf',
    description:
      'Resume file that was submitted with this application (snapshot).',
  })
  @Expose()
  submittedResumePath: string;

  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.PENDING,
    description: 'Current status of the application',
  })
  @Expose()
  status: ApplicationStatus;

  @ApiProperty({
    type: AdminUserInfo,
    description: 'Information about the user who submitted the application',
  })
  @Expose()
  @Type(() => AdminUserInfo)
  user: AdminUserInfo;

  @ApiProperty({
    type: AdminJobInfo,
    description: 'Information about the job the application is for',
  })
  @Expose()
  @Type(() => AdminJobInfo)
  job: AdminJobInfo;

  @ApiProperty({
    example: '2025-08-06T14:23:00Z',
    description: 'Timestamp when the application was created',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-07T10:05:00Z',
    description: 'Timestamp when the application was last updated',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    example: '2023-01-02T00:00:00.000Z',
    description: 'Timestamp when user was last deleted',
  })
  @Expose()
  deletedAt: Date;
}
