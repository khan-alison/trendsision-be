import { Module } from "@nestjs/common";
import { TourRegisterService } from "./tour-register.service";
import { TourRegisterController } from "./tour-register.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TourRegistration } from "src/entities/tour-registration.entity";
import { Tour } from "src/entities/tour.entity";
import { User } from "src/entities/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([TourRegistration, Tour, User])],
    providers: [TourRegisterService],
    controllers: [TourRegisterController],
})
export class TourRegisterModule {}
