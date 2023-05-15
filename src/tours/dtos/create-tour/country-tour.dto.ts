import { IsArray, IsString } from "class-validator";
import { CityEntity } from "src/entities/city.entity";

export class TourCountryDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsArray()
    cities: CityEntity[];
}
