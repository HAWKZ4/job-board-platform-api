import { ApiProperty } from '@nestjs/swagger';

export class RestoreDeletedJobResponseDto {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Job restored successfully',
    description: 'Operation status message',
  })
  message: string;
}
