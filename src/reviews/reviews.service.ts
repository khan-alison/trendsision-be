import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TourReview } from "src/entities/tour-reviews.entity";
import { Tour } from "src/entities/tour.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { CreateTourReviewDto } from "./dtos/create_review.dto";
import { UpdateReviewDto } from "./dtos/update_review.dto";

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(TourReview)
        private tourReviewRepository: Repository<TourReview>,
        @InjectRepository(Tour)
        private tourRepository: Repository<Tour>
    ) {}

    async getTourReview(reviewId?: string, userId?: string, tourId?: string) {
        let queryBuilder = this.tourReviewRepository
            .createQueryBuilder("tour_review")
            .leftJoinAndSelect("tour_review.tour", "tour")
            .leftJoinAndSelect("tour_review.user", "user");

        if (reviewId) {
            queryBuilder = queryBuilder.where("tour_review.id = :id", {
                id: reviewId,
            });
        } else if (userId) {
            queryBuilder = queryBuilder.where("tour_review.user_id = :userId", {
                userId: userId,
            });
        } else if (tourId) {
            queryBuilder = queryBuilder.where("tour_review.tour_id = :tourId", {
                tourId: tourId,
            });
        }

        const review = await queryBuilder.getOne();

        return review;
    }

    async getTourById(tourId: string) {
        const tour = await this.tourRepository.findOne({
            where: { id: tourId },
        });

        if (!tour) {
            throw new HttpException(
                `Tour with id:${tourId} not found.`,
                HttpStatus.NOT_FOUND
            );
        }

        return tour;
    }

    async getAllReviewsOfTour(
        tourId: string,
        page?: number,
        limit?: number
    ): Promise<TourReview[]> {
        await this.getTourById(tourId);
        const queryBuilder = this.tourReviewRepository
            .createQueryBuilder("tour_review")
            .leftJoinAndSelect("tour_review.tour", "tour")
            .leftJoinAndSelect("tour_review.user", "user")
            .where("tour_review.tour_id = :tourId", { tourId });

        if (page && limit) {
            queryBuilder.skip((page - 1) * limit).take(limit);
        }

        const tourReviews = await queryBuilder.getMany();
        return tourReviews;
    }

    async createNewReview(
        createTourReviewDto: CreateTourReviewDto,
        user: User
    ): Promise<TourReview> {
        const { ratingStar: rating, comment, tourId } = createTourReviewDto;

        const tour = await this.getTourById(tourId);

        const existingReview = await this.getTourReview(
            undefined,
            user.id,
            tourId
        );

        if (existingReview && existingReview.user.id === user.id) {
            throw new HttpException(
                "You have already reviewed this tour.",
                HttpStatus.CONFLICT
            );
        }

        const newReview = this.tourReviewRepository.create({
            tourId: tour.id,
            comment,
            createAt: new Date(),
            rating,
            userId: user.id,
        });

        tour.ratingsAverage = Number(
            (tour.ratingsAverage * tour.ratingsQuantity + rating) /
                (tour.ratingsQuantity + 1)
        );

        tour.ratingsQuantity += 1;
        try {
            await Promise.all([
                this.tourReviewRepository.save(newReview),
                this.tourRepository.save(tour),
            ]);
            return newReview;
        } catch (error) {
            throw new HttpException(
                "Failed to save the review.",
                HttpStatus.NOT_ACCEPTABLE
            );
        }
    }

    async updateReview(
        reviewId: string,
        userId: string,
        updateReviewDto: UpdateReviewDto
    ): Promise<TourReview> {
        let tour: Tour;
        const review = await this.getTourReview(reviewId, userId);
        await this.getTourById(review.tour.id);

        if (!review) {
            throw new HttpException("Not review yet", HttpStatus.NOT_FOUND);
        }

        if (review.user.id !== userId) {
            throw new HttpException(
                "Only owner of this rating can edit it",
                HttpStatus.FORBIDDEN
            );
        }

        if (updateReviewDto.rating) {
            tour = await this.tourRepository.findOne({
                where: { id: review.tourId },
            });

            const sumRatingAfterUpdate =
                tour.ratingsAverage * tour.ratingsQuantity -
                review.rating +
                updateReviewDto.rating;

            tour.ratingsAverage = sumRatingAfterUpdate / tour.ratingsQuantity;
        }

        try {
            Object.assign(review, updateReviewDto);
            review.updateAt = new Date(Date.now());
            await Promise.all([
                this.tourReviewRepository.save(review),
                this.tourRepository.save(tour),
            ]);
            return review;
        } catch (error) {
            throw new HttpException(
                `Error updating tour with id ${reviewId}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async deleteReview(reviewId: string, userId: string) {
        const review = await this.getTourReview(reviewId, userId);
        if (!review) {
            throw new HttpException("Not review yet", HttpStatus.NOT_FOUND);
        }

        const tour = await this.getTourById(review.tour.id);

        if (review.user.id !== userId) {
            throw new HttpException(
                "Only owner of this rating can delete it",
                HttpStatus.FORBIDDEN
            );
        }

        if (tour.ratingsQuantity === 1) {
            tour.ratingsAverage = 0;
            tour.ratingsQuantity = 0;
        } else {
            tour.ratingsAverage = Number(
                (tour.ratingsAverage * tour.ratingsQuantity - review.rating) /
                    (tour.ratingsQuantity - 1)
            );
            tour.ratingsQuantity -= 1;
        }

        try {
            await Promise.all([
                this.tourRepository.save(tour),
                this.tourReviewRepository.delete(reviewId),
            ]);
        } catch (error) {
            throw new HttpException(
                "Failed to delete the review.",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        return {
            message: "Delete review successfully",
            status: 200,
        };
    }
}
