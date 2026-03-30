import { IsDateString, IsIn, IsOptional, ValidateIf } from 'class-validator';

export class GetLinkStatsQueryDto {
  @IsOptional()
  @IsIn(['7d', '30d', 'all'])
  preset?: '7d' | '30d' | 'all';

  @ValidateIf((o: GetLinkStatsQueryDto) => o.to !== undefined)
  @IsDateString()
  from?: string;

  @ValidateIf((o: GetLinkStatsQueryDto) => o.from !== undefined)
  @IsDateString()
  to?: string;
}
