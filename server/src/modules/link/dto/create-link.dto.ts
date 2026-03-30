import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateLinkDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  customAlias?: string;
}
