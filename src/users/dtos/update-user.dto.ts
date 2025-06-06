import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/common/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  resume_url?: string;

  @IsOptional() // Optional so it defaults to 'user' if not provided
  @IsEnum(Role)
  role?: Role;
}
