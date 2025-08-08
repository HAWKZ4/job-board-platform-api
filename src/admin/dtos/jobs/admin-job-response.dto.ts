import { ApiProperty } from '@nestjs/swagger';
import { AdminJobDto } from './admin-job.dto';

export class AdminJobResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Job fetched successfully',
    description: 'Operation status message',
  })
  message: string;

  @ApiProperty({
    type: AdminJobDto,
    description: 'Job Data',
  })
  data: AdminJobDto;
}
