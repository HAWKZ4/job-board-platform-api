import { Expose } from 'class-transformer';
import { JobType } from '../enums/job-type.enum';

export class PublicJobDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  company: string;

  @Expose()
  location: string;

  @Expose()
  description: string;

  @Expose()
  category: string;

  @Expose()
  type: JobType;

  @Expose()
  remote: boolean;

  @Expose()
  requirements: string;

  @Expose()
  salaryRange: string;

  @Expose()
  createdAt: Date;
}
