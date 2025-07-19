import { Expose } from 'class-transformer';

export class UserWithoutCredentials {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  location: string;

  @Expose()
  resumeUrl: string | null = null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
