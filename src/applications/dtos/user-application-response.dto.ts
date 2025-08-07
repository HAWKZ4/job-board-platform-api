import { ApiProperty } from '@nestjs/swagger';
import { UserApplicationDto } from './user-application.dto';

export class UserApplicationResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Application fetched successfully',
    description: 'Operation status message',
  })
  message: string;

  @ApiProperty({
    type: UserApplicationDto,
    description: 'User data (safe fields only)',
  })
  data: UserApplicationDto;
}
