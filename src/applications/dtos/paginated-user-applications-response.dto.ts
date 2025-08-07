import { ApiProperty } from '@nestjs/swagger';
import { UserApplicationDto } from './user-application.dto';
import { MetaDto } from 'src/common/dtos/pagination/meta.dto';

export class PaginatedUserApplicationsResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Applications fetched successfully',
    description: 'Operation status message',
  })
  message: string;

  @ApiProperty({ type: [UserApplicationDto] })
  data: UserApplicationDto[];

  @ApiProperty({ type: MetaDto, description: 'Pagination metadata' })
  meta: MetaDto;
}
