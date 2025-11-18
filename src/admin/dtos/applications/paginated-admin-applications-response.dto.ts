import { ApiProperty } from '@nestjs/swagger';
import { AdminApplicationDto } from './admin-application.dto';
import { MetaDto } from 'src/common/dtos/pagination/meta.dto';

export class PaginatedAdminApplicationsResponseDto {
  @ApiProperty({ type: [AdminApplicationDto] })
  items: AdminApplicationDto[];

  @ApiProperty({ type: MetaDto, description: 'Pagination metadata' })
  meta: MetaDto;
}
