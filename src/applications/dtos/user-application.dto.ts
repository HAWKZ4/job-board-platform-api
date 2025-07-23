import { Expose, Type } from 'class-transformer';
import { ApplicationStatus } from '../enums/application-status.enum';

@Expose()
export class UserInfo {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;
}

@Expose()
export class JobInfo {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  company: string;
}

export class UserApplicationDto {
  @Expose()
  id: number;

  @Expose()
  coverLetter: string;

  @Expose()
  resumePath: string;

  @Expose()
  status: ApplicationStatus;

  @Expose()
  @Type(() => UserInfo)
  user: UserInfo;

  @Expose()
  @Type(() => JobInfo)
  job: JobInfo;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
