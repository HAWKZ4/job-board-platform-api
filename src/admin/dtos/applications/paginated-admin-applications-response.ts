import { ApiProperty } from '@nestjs/swagger';
import { AdminApplicationDto } from './admin-application.dto';

class MetaDto {
  @ApiProperty({ example: 100, description: 'Total number of items available' })
  totalItems: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items returned in this response',
  })
  itemCount: number;

  @ApiProperty({
    example: 10,
    description: 'Items per page (pagination limit)',
  })
  itemsPerPage: number;

  @ApiProperty({
    example: 10,
    description: 'Total number of pages',
  })
  totalPages: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  currentPage: number;
}

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
