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
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  company: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  location: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  category: string;

  @IsOptional()
  @IsEnum(JobType)
  type: JobType;

  @IsOptional()
  @IsBoolean()
  remote: boolean;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  requirements: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^\$\d{1,3}(,\d{3})*(\.\d{2})?\s*-\s*\$\d{1,3}(,\d{3})*(\.\d{2})?$/,
    { message: 'Salary range must be in format: "$XX,XXX - $YY,YYY"' },
  )
  salaryRange?: string;

  @IsOptional()
  @IsBoolean()
  @IsOptional()
  isPublished: boolean = true;
}
