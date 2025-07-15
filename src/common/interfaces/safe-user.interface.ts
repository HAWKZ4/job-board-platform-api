import { UserRole } from 'src/common/enums/user-role.enum';

export interface SafeUser {
  id: number;
  email: string;
  role: UserRole;
}
