import { ApiProperty } from '@nestjs/swagger';
import { MetaDto } from 'src/common/dtos/pagination/meta.dto';
import { UserJobDto } from './user-job.dto';

export class PaginatedUserJobsResponseDto {
  @ApiProperty({ type: [UserJobDto] })
  items: UserJobDto[];

  @ApiProperty({ type: MetaDto, description: 'Pagination metadata' })
  meta: MetaDto;
}
