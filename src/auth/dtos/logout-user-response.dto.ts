import { ApiProperty } from '@nestjs/swagger';

export class LogoutUserResponseDto {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'User logged out successfully',
    description: 'Operation status message',
  })
  message: string;
}
