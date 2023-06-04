import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tour } from "../entities/tour.entity";
import { ToursController } from "./tours.controller";
import { ToursService } from "./tours.service";
import { TourImage } from "src/entities/tour-image.entity";
import { City } from "src/entities/city.entity";
import { Country } from "src/entities/country.entity";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";
import { TourRegistration } from "src/entities/tour-registration.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Tour,
            TourImage,
            City,
            Country,
            TourRegistration,
        ]),
    ],
    controllers: [ToursController],
    providers: [
        ToursService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class ToursModule {}
