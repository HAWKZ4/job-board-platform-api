import { ApiProperty } from '@nestjs/swagger';
import { UserApplicationDto } from './user-application.dto';
import { MetaDto } from 'src/common/dtos/pagination/meta.dto';

export class PaginatedUserApplicationsResponseDto {
  @ApiProperty({ type: [UserApplicationDto] })
  items: UserApplicationDto[];

  @ApiProperty({ type: MetaDto, description: 'Pagination metadata' })
  meta: MetaDto;
}
