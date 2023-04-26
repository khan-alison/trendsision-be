import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tours } from "../entities/tour.entity";
import { ToursController } from "./tours.controller";
import { ToursService } from "./tours.service";
import { TourImage } from "src/entities/tour-image.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Tours, TourImage])],
    controllers: [ToursController],
    providers: [ToursService],
})
export class ToursModule {}
