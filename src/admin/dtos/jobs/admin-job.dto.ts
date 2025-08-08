import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PublicJobDto } from '../../../jobs/dtos/public-job.dto';

export class AdminJobDto extends PublicJobDto {
  @ApiProperty({ example: true })
  @Expose()
  isPublished: boolean;

  @ApiProperty({ example: '2025-08-01T12:00:00Z' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    example: null,
    description: 'Null if not soft-deleted, else timestamp',
  })
  @Expose()
  deletedAt: Date | null;
}
