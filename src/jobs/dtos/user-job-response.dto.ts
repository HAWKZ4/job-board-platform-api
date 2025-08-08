import { ApiProperty } from '@nestjs/swagger';
import { UserJobDto } from './user-job.dto';

export class UserJobResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Job fetched successfully',
    description: 'Operation status message',
  })
  message: string;

  @ApiProperty({
    type: UserJobDto,
    description: 'Job Data',
  })
  data: UserJobDto;
}
