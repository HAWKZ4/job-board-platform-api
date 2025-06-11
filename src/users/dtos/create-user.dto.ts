import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @MinLength(5)
  @IsString()
  password: string;

  @IsEnum(Role)
  @IsOptional() // Optional so it defaults to 'user' if not provided
  role?: Role = Role.USER; // Use the enum type, not string
}
