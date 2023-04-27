import { IsArray, IsString } from "class-validator";
import { City } from "src/entities/city.entity";

export class TourCountryDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsArray()
    cities: City[];
}
