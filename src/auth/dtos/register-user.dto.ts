import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
