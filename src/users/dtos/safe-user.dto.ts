import { Role } from 'src/common/role.enum';

export type SafeUserDto = {
  id: number;
  email: string;
  role: Role;
}
