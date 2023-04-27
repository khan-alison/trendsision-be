import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tour } from "../entities/tour.entity";
import { ToursController } from "./tours.controller";
import { ToursService } from "./tours.service";
import { TourImage } from "src/entities/tour-image.entity";
import { City } from "src/entities/city.entity";
import { Country } from "src/entities/country.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Tour, TourImage, City, Country])],
    controllers: [ToursController],
    providers: [ToursService],
})
export class ToursModule {}
