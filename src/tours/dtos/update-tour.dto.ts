import { IsOptional, IsString, IsNumber } from "class-validator";

export class UpdateTourDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    duration?: number;

    @IsOptional()
    @IsNumber()
    maxGroupSize?: number;

    @IsOptional()
    @IsString()
    difficulty?: string;

    @IsOptional()
    @IsNumber()
    ratingsAverage?: number;

    @IsOptional()
    @IsNumber()
    ratingsQuantity?: number;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsString()
    summary?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageCover?: string;
}
