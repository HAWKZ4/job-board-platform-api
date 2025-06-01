import { Role } from 'src/common/role.enum';

export class SafeUserDto {
  id: number;
  email: string;
  role: Role;
}
