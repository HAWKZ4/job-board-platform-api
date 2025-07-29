import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

export class AdminApplicationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  jobId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
