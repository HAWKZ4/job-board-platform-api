import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  firstName: string;

  @MinLength(3)
  @MaxLength(50)
  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @MinLength(3)
  @MaxLength(50)
  @IsString()
  location: string;
}
