import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TourReviewEntity } from "src/entities/tour-reviews.entity";
import { TourEntity } from "src/entities/tour.entity";
import { UserEntity } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { CreateTourReviewDto } from "./dto/create_review.dto";
import { UpdateReviewDto } from "./dto/update_review.dto";

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(TourReviewEntity)
        private tourReviewRepository: Repository<TourReviewEntity>,
        @InjectRepository(TourEntity)
        private tourRepository: Repository<TourEntity>
    ) {}
    async getAllReviews(
        page?: number,
        limit?: number
    ): Promise<TourReviewEntity[]> {
        const queryBuilder =
            this.tourReviewRepository.createQueryBuilder("tour_review");

        if (page && limit) {
            queryBuilder.skip((page - 1) * limit).take(limit);
        }
        const tourReviews = await queryBuilder
            .leftJoinAndSelect("tour_review.tour", "tour")
            .getMany();
        return tourReviews;
    }

    async createNewReview(
        createTourReviewDto: CreateTourReviewDto,
        user: UserEntity
    ): Promise<TourReviewEntity> {
        const { ratingStar, comment, tourId } = createTourReviewDto;

        const tour = await this.tourRepository.findOne({
            where: { id: tourId },
        });

        if (!tour) {
            throw new HttpException("Tour not found.", HttpStatus.NOT_FOUND);
        }

        const existingReview = await this.tourReviewRepository
            .createQueryBuilder("tour_review")
            .leftJoinAndSelect("tour_review.tour", "tour")
            .leftJoinAndSelect("tour_review.user", "user")
            .where("tour_review.tour = :tourId", { tourId: tourId })
            .getOne();

        if (existingReview && existingReview.user.id === user.id) {
            throw new HttpException(
                "You have already reviewed this tour.",
                HttpStatus.CONFLICT
            );
        }

        const newReview = this.tourReviewRepository.create({
            tour,
            comment,
            createAt: new Date(),
            rating: ratingStar,
            user,
        });

        tour.ratingsAverage = Number(
            (tour.ratingsAverage * tour.ratingsQuantity + ratingStar) /
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
    ): Promise<TourReviewEntity> {
        const review = await this.tourReviewRepository
            .createQueryBuilder("tour_review")
            .leftJoinAndSelect("tour_review.tour", "tour")
            .leftJoinAndSelect("tour_review.user", "user")
            .where("tour_review.id = :id", { id: reviewId })
            .getOne();

        if (!review) {
            throw new HttpException("Not review yet", HttpStatus.NOT_FOUND);
        }

        const tour = await this.tourRepository.findOne({
            where: { id: review.tour.id },
        });

        if (!tour) {
            throw new HttpException(
                `Tour with id: ${review.tour.id} doesn't exist`,
                HttpStatus.NOT_FOUND
            );
        }

        if (review.user.id !== userId) {
            throw new HttpException(
                "Only owner of this rating can edit it",
                HttpStatus.FORBIDDEN
            );
        }

        try {
            Object.assign(review, updateReviewDto);
            review.updateAt = new Date(Date.now());
            this.tourReviewRepository.save(review);
            return review;
        } catch (error) {
            throw new HttpException(
                `Error updating tour with id ${reviewId}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async deleteReview(reviewId: string, userId: string) {
        const review = await this.tourReviewRepository
            .createQueryBuilder("tour_review")
            .leftJoinAndSelect("tour_review.tour", "tour")
            .leftJoinAndSelect("tour_review.user", "user")
            .where("tour_review.id = :id", { id: reviewId })
            .getOne();

        if (!review) {
            throw new HttpException("Not review yet", HttpStatus.NOT_FOUND);
        }

        const tour = await this.tourRepository.findOne({
            where: { id: review.tour.id },
        });

        if (!tour) {
            throw new HttpException(
                `Tour with id: ${review.tour.id} doesn't exist`,
                HttpStatus.NOT_FOUND
            );
        }

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
