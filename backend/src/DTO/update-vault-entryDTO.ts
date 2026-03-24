import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateVaultEntryDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsDateString()
  visitedAt?: string;
}
