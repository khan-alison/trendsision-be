import { IsOptional, IsString, IsNumber, Max, Min } from "class-validator";

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
    @Max(5)
    @Min(1)
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
