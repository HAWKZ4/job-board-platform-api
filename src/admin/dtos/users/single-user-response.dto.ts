import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../../common/dtos/user/user.dto';

export class SingleUserResponseDto {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'User fetched successfully',
    description: 'Operation status message',
  })
  message: string;

  @ApiProperty({ type: UserDto, description: 'Full user details' })
  data: UserDto;
}
