import { ApiProperty } from '@nestjs/swagger';

export class RestoreDeletedUserResponseDto {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'User restored successfully',
    description: 'Operation status message',
  })
  message: string;
}
