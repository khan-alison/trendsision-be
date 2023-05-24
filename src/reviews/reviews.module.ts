import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TourReviewEntity } from "src/entities/tour-reviews.entity";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { TourEntity } from "src/entities/tour.entity";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [TypeOrmModule.forFeature([TourReviewEntity, TourEntity])],
    controllers: [ReviewsController],
    providers: [ReviewsService, JwtService],
})
export class ReviewsModule {}
