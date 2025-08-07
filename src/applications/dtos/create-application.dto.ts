import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({
    example: 23,
    description: 'The ID of the job to apply for',
  })
  @IsInt()
  jobId: number;

  @ApiProperty({
    example: 'I am excited to apply for this position because...',
    description:
      'Cover letter text explaining why you are applying for the job',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  coverLetter: string;
}
