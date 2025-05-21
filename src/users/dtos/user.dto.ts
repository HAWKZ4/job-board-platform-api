import { Expose } from 'class-transformer';
import { Role } from 'src/common/role.enum';

export class UserDto {
  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: Role; // Use the enum type, not string
}
