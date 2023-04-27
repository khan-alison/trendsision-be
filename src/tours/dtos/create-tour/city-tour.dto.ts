import { IsArray, IsString } from "class-validator";
import { TourCountryDto } from "./country-tour.dto";

export class TourCityDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsArray()
    country: TourCountryDto;

    @IsArray()
    tours: string[];
}
