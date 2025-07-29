import { IsBooleanString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

export class AdminJobQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBooleanString()
  showDeleted?: string;
}
