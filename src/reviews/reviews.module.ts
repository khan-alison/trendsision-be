import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TourReview } from "src/entities/tour-reviews.entity";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { Tour } from "src/entities/tour.entity";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [TypeOrmModule.forFeature([TourReview, Tour])],
    controllers: [ReviewsController],
    providers: [ReviewsService, JwtService],
})
export class ReviewsModule {}
