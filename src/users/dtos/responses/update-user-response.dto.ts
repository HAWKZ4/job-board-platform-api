import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from '../safe-user.dto';

export class UpdateUserResponseDto {
  @ApiProperty({
    type: SafeUserDto,
    description: 'Updated user data (safe fields)',
  })
  data: SafeUserDto;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'User updated successfully',
    description: 'Operation status message',
  })
  message: string;
}
