import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsInt()
  jobId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  coverLetter: string;
}
