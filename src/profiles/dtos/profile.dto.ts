import { Expose } from 'class-transformer';

export class ProfileDto {
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
  resumeUrl: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
