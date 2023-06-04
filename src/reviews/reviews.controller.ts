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
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { UserDecorator } from "src/decorators/current-user.decorator";
import { TourReview } from "src/entities/tour-reviews.entity";
import { User } from "src/entities/user.entity";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { CreateTourReviewDto } from "./dtos/create_review.dto";
import { UpdateReviewDto } from "./dtos/update_review.dto";
import { ReviewsService } from "./reviews.service";
import { RolesGuard } from "src/guards/roles.guard";
import { Roles } from "src/decorators/roles.decorator";
import { ROLES } from "src/utils/constants";

@Controller("reviews")
@ApiTags("reviews")
@SkipThrottle()
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) {}

    @Get("/:id")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get all reviews" })
    @ApiParam({
        name: "id",
        description: "The ID of the tour.",
        type: "string",
    })
    @ApiQuery({ name: "page", type: Number, required: false })
    @ApiQuery({ name: "limit", type: Number, required: false })
    @ApiResponse({
        status: 200,
        description: "Returns an array of tour reviews",
        type: TourReview,
        isArray: true,
    })
    async getAllReviewsOfTour(
        @Param("id") tourId: string,
        @Query() query: any
    ): Promise<TourReview[]> {
        const { page, limit } = query;

        return await this.reviewsService.getAllReviewsOfTour(
            tourId,
            parseInt(page),
            parseInt(limit)
        );
    }

    @Post()
    @Roles(ROLES.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Create new review" })
    @ApiResponse({
        status: 201,
        description: "Create new review",
        type: TourReview,
    })
    async createNewRating(
        @Body() createTourReviewDto: CreateTourReviewDto,
        @UserDecorator() user: User
    ): Promise<TourReview> {
        return await this.reviewsService.createNewReview(
            createTourReviewDto,
            user
        );
    }

    @Patch("/:id")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Edit existed review" })
    @ApiParam({
        name: "id",
        description: "The ID of the user.",
        type: "string",
    })
    @ApiResponse({
        status: 200,
        description: "Returns the updated review",
        type: TourReview,
    })
    @ApiBody({
        type: CreateTourReviewDto,
        examples: {
            example1: {
                value: {
                    tourId: "7bd2f7a5-ea8d-47f2-b8d1-5373ee283d84",
                    ratingStar: 3,
                    comment: "bad",
                },
            },
        },
    })
    async updateReview(
        @Param("id") id: string,
        @UserDecorator() user: User,
        @Body() updateReviewDto: UpdateReviewDto
    ): Promise<TourReview> {
        return await this.reviewsService.updateReview(
            id,
            user.id,
            updateReviewDto
        );
    }

    @Delete("/:id")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Delete review" })
    @ApiParam({
        name: "id",
        description: "The ID of the user.",
        type: "string",
    })
    async deleteReview(@Param("id") id: string, @UserDecorator() user: User) {
        return await this.reviewsService.deleteReview(id, user.id);
    }
}
