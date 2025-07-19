import { Expose } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';

export class SafeUserDto {
  @Expose()
  id: number;
  @Expose()
  email: string;
  @Expose()
  role: UserRole;
}
