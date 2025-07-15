import { User } from '../../users/entities/user.entity';

export type UserWithCredentials = Pick<
  User,
  'id' | 'email' | 'role' | 'password' | 'refreshToken'
>;

export type UserWithoutCredeitals = Omit<User, 'refreshToken' | 'password'>;
