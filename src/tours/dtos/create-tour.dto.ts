import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from "class-validator";
import { TourImageDto } from "./tour-image.dto";

export class CreateTourDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    duration: number;

    @IsNumber()
    @IsNotEmpty()
    maxGroupSize: number;

    @IsString()
    @IsNotEmpty()
    difficulty: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    ratingsAverage: number;

    @IsNumber()
    @IsOptional()
    ratingsQuantity: number;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsNotEmpty()
    summary: string;

    @IsString()
    description: string;

    @IsString()
    @IsNotEmpty()
    imageCover: string;

    @IsArray()
    images: TourImageDto[];
}
