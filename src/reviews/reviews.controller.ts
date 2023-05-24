import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { SkipThrottle } from "@nestjs/throttler";
import { TourReviewEntity } from "src/entities/tour-reviews.entity";
import { UserDecorator } from "src/decorators/current-user.decorator";
import { UserEntity } from "src/entities/user.entity";
import { CreateTourReviewDto } from "./dto/create_review.dto";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { UpdateReviewDto } from "./dto/update_review.dto";

@Controller("reviews")
@SkipThrottle()
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) {}

    @Get()
    async getAllReviews(@Query() query: any): Promise<TourReviewEntity[]> {
        const { page, limit } = query;

        return await this.reviewsService.getAllReviews(
            parseInt(page),
            parseInt(limit)
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createNewRating(
        @Body() createTourReviewDto: CreateTourReviewDto,
        @UserDecorator() user: UserEntity
    ): Promise<TourReviewEntity> {
        return await this.reviewsService.createNewReview(
            createTourReviewDto,
            user
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch("/:id")
    async updateReview(
        @Param("id") id: string,
        @UserDecorator() user: UserEntity,
        @Body() updateReviewDto: UpdateReviewDto
    ): Promise<TourReviewEntity> {
        return await this.reviewsService.updateReview(
            id,
            user.id,
            updateReviewDto
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete("/:id")
    async deleteReview(
        @Param("id") id: string,
        @UserDecorator() user: UserEntity
    ) {
        return await this.reviewsService.deleteReview(id, user.id);
    }
}
