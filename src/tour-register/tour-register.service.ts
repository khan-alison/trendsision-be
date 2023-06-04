import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { RegisterTourDTO } from "./dtos/registerTour.dto";
import { TourRegistration } from "src/entities/tour-registration.entity";
import { Tour } from "src/entities/tour.entity";
import { User } from "src/entities/user.entity";

@Injectable()
export class TourRegisterService {
    constructor(
        @InjectRepository(TourRegistration)
        private tourRegistrationRepository: Repository<TourRegistration>,
        @InjectRepository(Tour)
        private tourRepository: Repository<Tour>,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    private createMyTourRegistrationQueryBuilder(
        userId: string
    ): SelectQueryBuilder<TourRegistration> {
        return this.tourRegistrationRepository
            .createQueryBuilder("tour_register")
            .where("tour_register.userId = :userId", { userId });
    }

    private createTourRegistrationQueryBuilder(
        tourId: string,
        page?: number,
        limit?: number
    ): SelectQueryBuilder<TourRegistration> {
        const queryBuilder = this.tourRegistrationRepository
            .createQueryBuilder("tour_register")
            .leftJoinAndSelect("tour_register.user", "user")
            .leftJoinAndSelect("tour_register.tour", "tour")
            .where("tour_register.tourId = :tourId", { tourId });

        if (page && limit) {
            queryBuilder.skip((page - 1) * limit).take(limit);
        }

        return queryBuilder;
    }

    async findTourRegistrationByIdAndUser(
        tourRegistrationId: string,
        userId: string
    ): Promise<TourRegistration> {
        const tourRegistered = await this.tourRegistrationRepository
            .createQueryBuilder("tour_register")
            .where("tour_register.id = :tourRegistrationId", {
                tourRegistrationId,
            })
            .where("tour_register.userId = :userId", { userId })
            .getOne();

        if (!tourRegistered) {
            throw new HttpException(
                "Tour registration not found",
                HttpStatus.NOT_FOUND
            );
        }

        return tourRegistered;
    }

    async removeTourRegistration(
        tourRegistration: TourRegistration
    ): Promise<void> {
        try {
            await this.tourRegistrationRepository.remove(tourRegistration);
        } catch (error) {
            throw new HttpException(
                "An error occurred while processing your request.",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async validateCreateTourRegistration(
        user: User,
        tour: Tour
    ): Promise<void> {
        const existingRegistration = await this.tourRegistrationRepository
            .createQueryBuilder("tour_registration")
            .where("tour_registration.tourId = :tourId", { tourId: tour.id })
            .andWhere("tour_registration.userId = :userId", { userId: user.id })
            .getOne();

        if (existingRegistration) {
            throw new HttpException(
                "You have already registered for this tour.",
                HttpStatus.BAD_REQUEST
            );
        }

        const registrations = await this.tourRegistrationRepository.find({
            where: { tourId: tour.id },
        });
        const guides = registrations.filter(
            (registration) => registration.user.role === "guide"
        );
        const users = registrations.filter(
            (registration) => registration.user.role === "user"
        );

        if (user.role === "guide" && guides.length >= tour.maxTourGuider) {
            throw new HttpException(
                "This tour already has the maximum number of tour guides.",
                HttpStatus.BAD_REQUEST
            );
        }

        if (user.role === "user" && users.length >= tour.maxGroupSize) {
            throw new HttpException(
                "This tour is already full.",
                HttpStatus.BAD_REQUEST
            );
        }
    }

    private createTourRegistration(
        tour: Tour,
        user: User,
        registerTourDto: RegisterTourDTO
    ): TourRegistration {
        return this.tourRegistrationRepository.create({
            ...registerTourDto,
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phoneNumber: user.phoneNumber || registerTourDto.phoneNumber,
            dateOfBirth: user.dateOfBirth || registerTourDto.dateOfBirth,
            userId: user.id,
            tourId: tour.id,
        });
    }

    async getAllRegistrationByTourId(
        tourId: string,
        page?: number,
        limit?: number
    ): Promise<TourRegistration[]> {
        try {
            if (page && limit && page <= 0 && limit <= 0) {
                throw new HttpException(
                    "Page and limit values should be greater than zero.",
                    HttpStatus.BAD_REQUEST
                );
            }

            const queryBuilder = this.createTourRegistrationQueryBuilder(
                tourId,
                page,
                limit
            );

            return await queryBuilder.getMany();
        } catch (error) {
            throw new HttpException(
                "An error occurred while processing your request.",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async registerTour(
        tourId: string,
        registerTourDto: RegisterTourDTO,
        user: User
    ): Promise<TourRegistration> {
        try {
            const tour = await this.tourRepository.findOne({
                where: { id: tourId },
            });

            if (!tour) {
                throw new HttpException(
                    `The tour with id ${tourId} doesn't exist.`,
                    HttpStatus.NOT_FOUND
                );
            }

            await this.validateCreateTourRegistration(user, tour);

            const tourRegister = this.createTourRegistration(
                tour,
                user,
                registerTourDto
            );

            await this.tourRegistrationRepository.save(tourRegister);
            return tourRegister;
        } catch (error) {
            throw new HttpException(
                "An error occurred while processing your request.",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAllMyTourRegistration(
        userId: string
    ): Promise<TourRegistration[]> {
        try {
            const myPurchases = await this.createMyTourRegistrationQueryBuilder(
                userId
            ).getMany();

            return myPurchases;
        } catch (error) {
            throw new HttpException(
                "An error occurred while processing your request.",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async cancelTourRegistration(
        tourRegistrationId: string,
        userId: string
    ): Promise<void> {
        try {
            const tourRegistration = await this.findTourRegistrationByIdAndUser(
                tourRegistrationId,
                userId
            );

            await this.removeTourRegistration(tourRegistration);
        } catch (error) {
            if (
                error instanceof HttpException &&
                error.getStatus() === HttpStatus.NOT_FOUND
            ) {
                throw error;
            } else {
                throw new HttpException(
                    "An error occurred while processing your request.",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
}
