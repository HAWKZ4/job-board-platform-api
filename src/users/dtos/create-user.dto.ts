import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/common/enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  lastName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  location: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @MinLength(5)
  @IsString()
  password: string;

  @IsEnum(UserRole)
  @IsOptional() // Optional so it defaults to 'user' if not provided
  role?: UserRole = UserRole.USER; // Use the enum type, not string
}
