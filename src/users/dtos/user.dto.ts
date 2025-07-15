import { Expose } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  location: string;

  @Expose()
  email: string;

  @Expose()
  role: UserRole; // Use the enum type, not string

  @Expose() // Only expose to admins
  resumeUrl?: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
