import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteProfileDto {
  @ApiProperty({
    description: 'Password confirmation required to delete the profile',
    example: 'MySecureP@ssw0rd',
  })
  @IsString()
  password: string;
}
