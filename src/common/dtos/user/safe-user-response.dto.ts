import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from './safe-user.dto';

export class SafeUserResponseDto {
  @ApiProperty({
    type: SafeUserDto,
    description: 'User data (safe fields only)',
  })
  user: SafeUserDto;
}
