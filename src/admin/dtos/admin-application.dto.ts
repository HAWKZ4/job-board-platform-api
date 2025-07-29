import { Expose, Type } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ApplicationStatus } from '../../applications/enums/application-status.enum';

@Expose()
export class AdminUserInfo {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  resumeUrl: string | null;

  @Expose()
  role: UserRole;
}

@Expose()
export class AdminJobInfo {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  company: string;

  @Expose()
  location: string;
}

export class AdminApplicationDto {
  @Expose()
  id: number;

  @Expose()
  coverLetter: string;

  @Expose()
  resumePath: string;

  @Expose()
  status: ApplicationStatus;

  @Expose()
  @Type(() => AdminUserInfo)
  user: AdminUserInfo;

  @Expose()
  @Type(() => AdminJobInfo)
  job: AdminJobInfo;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
