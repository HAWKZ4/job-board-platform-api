import { Expose, Transform } from 'class-transformer';
import { Role } from 'src/common/role.enum';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: Role; // Use the enum type, not string

  @Expose({ groups: ['admin'] }) // Only expose to admins
  resume_url?: string;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  created_at: Date;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  updated_at: Date;
}
