import { Expose } from 'class-transformer';

export class ResumeUploadResponseDto {
  @Expose()
  resumeUrl: string;
}
