import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateVaultEntryDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  photoBase64?: string;

  @IsOptional()
  @IsDateString()
  visitedAt?: string;
}
