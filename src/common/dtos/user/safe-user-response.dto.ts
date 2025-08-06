import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from './safe-user.dto';

export class SafeUserResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'User fetched successfully',
    description: 'Operation status message',
  })
  message: string;

  @ApiProperty({
    type: SafeUserDto,
    description: 'User data (safe fields only)',
  })
  data: SafeUserDto;
}
