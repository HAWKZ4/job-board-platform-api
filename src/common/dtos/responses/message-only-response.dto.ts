import { ApiProperty } from '@nestjs/swagger';

export class MessageOnlyResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;
}
