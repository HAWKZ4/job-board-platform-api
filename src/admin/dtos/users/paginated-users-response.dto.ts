import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../../common/dtos/user/user.dto';
import { MetaDto } from 'src/common/dtos/pagination/meta.dto';

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserDto] })
  items: UserDto[];

  @ApiProperty({ type: MetaDto, description: 'Pagination metadata' })
  meta: MetaDto;
}
