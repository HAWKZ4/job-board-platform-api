import { ApiProperty } from '@nestjs/swagger';
import { AdminApplicationDto } from './admin-application.dto';

export class AdminApplicationResponseDto {
  @ApiProperty({ type: AdminApplicationDto })
  data: AdminApplicationDto;

  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Application fetched successfully',
    description: 'Operation status message',
  })
  message: string;
}
