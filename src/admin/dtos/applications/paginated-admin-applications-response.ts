import { ApiProperty } from '@nestjs/swagger';
import { AdminApplicationDto } from './admin-application.dto';
import { MetaDto } from 'src/common/dtos/pagination/meta.dto';

export class PaginatedAdminApplicationsResponseDto {
  @ApiProperty({ type: [AdminApplicationDto] })
  data: AdminApplicationDto[];

  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Applications fetched successfully',
    description: 'Operation status message',
  })
  message: string;

  @ApiProperty({ type: MetaDto, description: 'Pagination metadata' })
  meta: MetaDto;
}
