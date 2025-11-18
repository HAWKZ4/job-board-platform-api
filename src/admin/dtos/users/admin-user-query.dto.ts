import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos/pagination/pagination-query.dto';

export class AdminUserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'true',
    description: 'Whether to include soft-deleted users',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  showDeleted?: boolean;
}
