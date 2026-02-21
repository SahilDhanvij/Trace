import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class createEdgeDTO {
    @IsString()
    @IsNotEmpty()
    fromId: string;

    @IsString()
    @IsNotEmpty()
    toId: string;

    @IsString()
    @IsOptional()
    traveledAt?: string;
}