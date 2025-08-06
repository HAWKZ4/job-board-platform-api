import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../../common/dtos/user/user.dto';

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

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserDto] })
  data: UserDto[];

  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Users fetched successfully',
    description: 'Operation status message',
  })
  message: string;

  @ApiProperty({ type: MetaDto, description: 'Pagination metadata' })
  meta: MetaDto;
}
