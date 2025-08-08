import { ApiProperty } from '@nestjs/swagger';
import { MetaDto } from 'src/common/dtos/pagination/meta.dto';
import { AdminJobDto } from './admin-job.dto';

export class PaginatedAdminJobsResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Jobs fetched successfully',
    description: 'Operation status message',
  })
  message: string;

  @ApiProperty({ type: [AdminJobDto] })
  data: AdminJobDto[];

  @ApiProperty({ type: MetaDto, description: 'Pagination metadata' })
  meta: MetaDto;
}
