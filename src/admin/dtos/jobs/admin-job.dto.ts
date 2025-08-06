import { Expose } from 'class-transformer';
import { PublicJobDto } from '../../../jobs/dtos/public-job.dto';

export class AdminJobDto extends PublicJobDto {
  @Expose()
  isPublished: boolean;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;
}
