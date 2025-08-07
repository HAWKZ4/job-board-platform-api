import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    description: 'New status for the application',
    example: ApplicationStatus.ACCEPTED,
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
