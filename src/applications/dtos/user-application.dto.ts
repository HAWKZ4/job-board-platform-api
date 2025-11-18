import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../enums/application-status.enum';

export class UserInfo {
  @ApiProperty({ example: 12, description: 'User ID who applied to the job' })
  @Expose()
  id: number;

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @Expose()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email of the user',
  })
  @Expose()
  email: string;
}

export class JobInfo {
  @ApiProperty({
    example: 45,
    description: 'Job ID related to the application',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'Frontend Developer',
    description: 'Title of the job',
  })
  @Expose()
  title: string;

  @ApiProperty({ example: 'Google', description: 'Company offering the job' })
  @Expose()
  company: string;
}

export class UserApplicationDto {
  @ApiProperty({ example: 101, description: 'Unique ID of the application' })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'I am passionate about frontend technologies...',
    description: 'Cover letter submitted with the application',
  })
  @Expose()
  coverLetter: string;

  @ApiProperty({
    example: '/uploads/resumes/resume-old.pdf',
    description:
      'The resume file that YOU submitted with this application (snapshot).',
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
    type: JobInfo,
    description: 'Basic information about the job applied for',
  })
  @Expose()
  @Type(() => JobInfo)
  job: JobInfo;

  @ApiProperty({
    example: '2025-08-07T13:45:30.000Z',
    description: 'Date and time when the application was created',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-07T14:22:10.000Z',
    description: 'Date and time when the application was last updated',
  })
  @Expose()
  updatedAt: Date;
}
