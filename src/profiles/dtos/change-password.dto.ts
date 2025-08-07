import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'OldP@ssword123',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password to update',
    example: 'N3wSecureP@ss',
  })
  @IsString()
  newPassword: string;
}
