import { PickType } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class SafeUserDto extends PickType(UserDto, [
  'id',
  'email',
  'role',
  'firstName',
  'lastName',
  'location',
] as const) {}
