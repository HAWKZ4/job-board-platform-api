import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';

export class SafeUserDto {
  @ApiProperty({ example: 1, description: 'Unique identifier for the user' })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @Expose()
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'User role',
  })
  @Expose()
  role: UserRole;
}
