import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos/pagination/pagination-query.dto';

export class AdminJobQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'TechCorp',
    description: 'Filter by company name',
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({
    example: 'Amsterdam',
    description: 'Filter by location',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: 'Frontend Developer',
    description: 'Filter by job title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Whether to include soft-deleted jobs',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  showDeleted?: boolean;
}
