import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../../common/dtos/user/user.dto';
import { MetaDto } from 'src/common/dtos/pagination/meta.dto';

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
