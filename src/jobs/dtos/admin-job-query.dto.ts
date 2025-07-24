import { IsIn, IsOptional, IsString } from 'class-validator';

export class AdminJobQueryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  showDeleted?: 'true' | 'false';
}
