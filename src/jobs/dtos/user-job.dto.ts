import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '../enums/job-type.enum';

export class UserJobDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Senior Frontend Developer' })
  @Expose()
  title: string;

  @ApiProperty({ example: 'TechCorp Inc.' })
  @Expose()
  company: string;

  @ApiProperty({ example: 'Amsterdam, Netherlands' })
  @Expose()
  location: string;

  @ApiProperty({
    example:
      'Join our team as a frontend developer working with React and TypeScript.',
  })
  @Expose()
  description: string;

  @ApiProperty({ example: 'Software Engineering' })
  @Expose()
  category: string;

  @ApiProperty({ enum: JobType, example: JobType.FULL_TIME })
  @Expose()
  type: JobType;

  @ApiProperty({ example: true })
  @Expose()
  remote: boolean;

  @ApiProperty({
    example: '3+ years of experience with modern JavaScript frameworks',
  })
  @Expose()
  requirements: string;

  @ApiProperty({ example: '$50,000 - $70,000' })
  @Expose()
  salaryRange: string;

  @ApiProperty({ example: '2025-08-01T12:00:00Z' })
  @Expose()
  updatedAt: Date;
}
