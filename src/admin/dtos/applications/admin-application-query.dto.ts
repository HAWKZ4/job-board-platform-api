import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
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
}
