import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { JobType } from '../enums/job-type.enum';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Frontend Developer' })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'TechCorp Inc.' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  company: string;

  @ApiProperty({ example: 'Amsterdam, Netherlands' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  location: string;

  @ApiProperty({
    example: 'We are hiring a frontend developer with React experience.',
  })
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 'Software Engineering' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  category: string;

  @ApiProperty({ enum: JobType, example: JobType.FULL_TIME })
  @IsEnum(JobType)
  type: JobType;

  @ApiProperty({ example: true })
  @IsBoolean()
  remote: boolean;

  @ApiProperty({ example: '3+ years of experience with React and TypeScript' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  requirements: string;

  @ApiPropertyOptional({
    example: '$60,000 - $80,000',
    description: 'Must match format "$XX,XXX - $YY,YYY"',
  })
  @IsOptional()
  @IsString()
  @Matches(
    /^\$\d{1,3}(,\d{3})*(\.\d{2})?\s*-\s*\$\d{1,3}(,\d{3})*(\.\d{2})?$/,
    { message: 'Salary range must be in format: "$XX,XXX - $YY,YYY"' },
  )
  salaryRange?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublished: boolean = true;
}
