import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserRequestDto {
  @ApiProperty({
    example: 'test@test.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@ssword123',
    description: 'Password for the user account',
  })
  @IsString()
  password: string;
}
