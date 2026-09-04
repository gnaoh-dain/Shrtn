import { IsUrl } from 'class-validator';

export class UpdateLinkDto {
  @IsUrl()
  url: string;
}
