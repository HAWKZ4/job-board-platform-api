import { ApiProperty } from '@nestjs/swagger';
import { ProfileDto } from './profile.dto';

export class ProfileResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Profile fetched successfully',
    description: 'Operation status message',
  })
  message: string;

  @ApiProperty({
    type: ProfileDto,
    description: 'User data (safe fields only)',
  })
  data: ProfileDto;
}
