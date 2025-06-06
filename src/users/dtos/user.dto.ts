import { Expose } from 'class-transformer';
import { Role } from 'src/common/role.enum';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: Role; // Use the enum type, not string

  @Expose()
  resume_url: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}
