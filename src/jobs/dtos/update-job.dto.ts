import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateJobDto {
  @ApiPropertyOptional({ example: 'Updated Job Title' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'New Company Name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  company: string;

  @ApiPropertyOptional({ example: 'Remote' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  location: string;

  @ApiPropertyOptional({ example: 'Updated job description' })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({ example: 'DevOps' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  category: string;

  @ApiPropertyOptional({ enum: JobType, example: JobType.CONTRACT })
  @IsOptional()
  @IsEnum(JobType)
  type: JobType;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  remote: boolean;

  @ApiPropertyOptional({ example: 'Experience with Docker and Kubernetes' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  requirements: string;

  @ApiPropertyOptional({ example: '$70,000 - $90,000' })
  @IsOptional()
  @IsString()
  @Matches(
    /^\$\d{1,3}(,\d{3})*(\.\d{2})?\s*-\s*\$\d{1,3}(,\d{3})*(\.\d{2})?$/,
    { message: 'Salary range must be in format: "$XX,XXX - $YY,YYY"' },
  )
  salaryRange?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPublished: boolean = true;
}
