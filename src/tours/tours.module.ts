import { Module } from "@nestjs/common";
import { ToursController } from "./tours.controller";
import { ToursService } from "./tours.service";
import { Tour } from "../entities/tour.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([Tour])],
    controllers: [ToursController],
    providers: [ToursService],
})
export class ToursModule {}
