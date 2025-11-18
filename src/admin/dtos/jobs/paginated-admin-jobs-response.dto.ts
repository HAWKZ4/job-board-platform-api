import { ApiProperty } from '@nestjs/swagger';
import { MetaDto } from 'src/common/dtos/pagination/meta.dto';
import { AdminJobDto } from './admin-job.dto';

export class PaginatedAdminJobsResponseDto {
  @ApiProperty({ type: [AdminJobDto] })
  items: AdminJobDto[];

  @ApiProperty({ type: MetaDto, description: 'Pagination metadata' })
  meta: MetaDto;
}
