import { ApiProperty } from '@nestjs/swagger';
import { MetaDto } from 'src/common/dtos/pagination/meta.dto';
import { UserJobDto } from './user-job.dto';

export class PaginatedUserJobsResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Jobs fetched successfully',
    description: 'Operation status message',
  })
  message: string;

  @ApiProperty({ type: [UserJobDto] })
  data: UserJobDto[];

  @ApiProperty({ type: MetaDto, description: 'Pagination metadata' })
  meta: MetaDto;
}
