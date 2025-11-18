import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos/pagination/pagination-query.dto';

export class AdminApplicationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 12,
    description: 'Filter applications by job ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  jobId?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Filter applications by user ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Whether to include soft-deleted applications',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  showDeleted?: boolean;
}
