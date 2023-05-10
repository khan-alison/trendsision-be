import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TourEntity } from "../entities/tour.entity";
import { ToursController } from "./tours.controller";
import { ToursService } from "./tours.service";
import { TourImageEntity } from "src/entities/tour-image.entity";
import { CityEntity } from "src/entities/city.entity";
import { CountryEntity } from "src/entities/country.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TourEntity,
            TourImageEntity,
            CityEntity,
            CountryEntity,
        ]),
    ],
    controllers: [ToursController],
    providers: [ToursService],
})
export class ToursModule {}
