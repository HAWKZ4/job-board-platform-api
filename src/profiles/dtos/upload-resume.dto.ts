import { ApiProperty } from '@nestjs/swagger';

export class UploadResumeDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Resume file in PDF format (5MB MAX)',
  })
  file: any;
}
