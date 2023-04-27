import {
    IsArray,
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from "class-validator";
import { TourCityDto } from "./city-tour.dto";
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
    coverImage: string;

    @IsArray()
    images: TourImageDto[];

    @IsNotEmpty()
    city: TourCityDto;

    @IsDateString()
    startDate: Date;

    @IsDateString()
    endDate: Date;
}
