import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { City } from "src/entities/city.entity";
import { Country } from "src/entities/country.entity";
import { Repository } from "typeorm";
import { TourImage } from "../entities/tour-image.entity";
import { Tour } from "../entities/tour.entity";
import { CreateTourDTO } from "./dtos/create-tour/create-tour.dto";
import { UpdateTourDto } from "./dtos/update-tour.dto";
import { TourRegistration } from "src/entities/tour-registration.entity";

@Injectable()
export class ToursService {
    constructor(
        @InjectRepository(TourImage)
        private tourImageRepository: Repository<TourImage>,
        @InjectRepository(Tour)
        private toursRepository: Repository<Tour>,
        @InjectRepository(City)
        private tourCityRepository: Repository<City>,
        @InjectRepository(Country)
        private tourCountryRepository: Repository<Country>,
        @InjectRepository(TourRegistration)
        private tourRegistrationRepository: Repository<TourRegistration>
    ) {
        this.toursRepository = toursRepository;
        this.tourImageRepository = tourImageRepository;
    }

    async getAllTour(
        filter?: any,
        page?: number,
        limit?: number
    ): Promise<Tour[]> {
        const queryBuilder = this.toursRepository
            .createQueryBuilder("tour")
            .leftJoinAndSelect("tour.cities", "city")
            .leftJoinAndSelect("tour.images", "image")
            .leftJoinAndSelect("tour.userRegistrations", "tour_registration")
            .leftJoinAndSelect("tour_registration.user", "user");

        if (filter) {
            if (filter.minPrice && filter.maxPrice) {
                queryBuilder.andWhere(
                    "tour.price BETWEEN :minPrice AND :maxPrice",
                    {
                        minPrice: filter.minPrice,
                        maxPrice: filter.maxPrice,
                    }
                );
            } else {
                if (filter.minPrice) {
                    queryBuilder.andWhere("tour.price >= :minPrice", {
                        minPrice: filter.minPrice,
                    });
                }

                if (filter.maxPrice) {
                    queryBuilder.andWhere("tour.price <= :maxPrice", {
                        maxPrice: filter.maxPrice,
                    });
                }
            }

            if (filter.difficulty) {
                queryBuilder.andWhere("tour.difficulty = :difficulty", {
                    difficulty: filter.difficulty,
                });
            }

            if (filter.ratingsAverage) {
                queryBuilder.andWhere(
                    "tour.ratingsAverage >= :ratingsAverage",
                    {
                        ratingsAverage: filter.ratingsAverage,
                    }
                );
            }

            if (filter.name) {
                queryBuilder.andWhere("tour.name LIKE :name", {
                    name: `%${filter.name}%`,
                });
            }

            if (filter.tourType) {
                queryBuilder.andWhere("tour.tourType LIKE :tourType", {
                    tourType: `%${filter.tourType}%`,
                });
            }

            if (filter.tourLocation) {
                queryBuilder.andWhere("tour.tour_location LIKE :tourLocation", {
                    tourLocation: `%${filter.tourLocation}%`,
                });
            }

            if (filter.minDuration && filter.maxDuration) {
                queryBuilder.andWhere(
                    "tour.duration BETWEEN :minDuration AND :maxDuration",
                    {
                        minDuration: filter.minDuration,
                        maxDuration: filter.maxDuration,
                    }
                );
            } else {
                if (filter.minDuration) {
                    queryBuilder.andWhere("tour.duration >= :minDuration", {
                        minDuration: filter.minDuration,
                    });
                }

                if (filter.maxDuration) {
                    queryBuilder.andWhere("tour.duration <= :maxDuration", {
                        maxDuration: filter.maxDuration,
                    });
                }
            }
        }

        if (page && limit) {
            queryBuilder.skip((page - 1) * limit).take(limit);
        }

        const tours = await queryBuilder.getMany();

        return tours;
    }

    async getTourById(id: string): Promise<Tour> {
        const tour = await this.toursRepository.findOne({
            where: { id },
            relations: ["images", "cities"],
        });

        if (!tour) {
            throw new HttpException(
                `Tour with id ${id} not found`,
                HttpStatus.NOT_FOUND
            );
        }
        return tour;
    }

    async getAllUserRegisteredTour(
        page?: number,
        limit?: number
    ): Promise<any[]> {
        const queryBuilder = this.tourRegistrationRepository
            .createQueryBuilder("user_registration")
            .leftJoinAndSelect("user_registration.user", "user");

        if (page && limit) {
            queryBuilder.skip((page - 1) * limit).take(limit);
        }

        const registrations = await queryBuilder.getMany();
        const users = registrations.map((registration) => {
            delete registration.user.password;
            return registration.user;
        });

        return users;
    }

    async createTour(createTourDto: CreateTourDTO): Promise<Tour> {
        const {
            name,
            duration,
            maxTourGuider,
            maxGroupSize,
            difficulty,
            price,
            summary,
            description,
            coverImage,
            images,
            cities,
            startDate,
            endDate,
            tourType,
            tourLocation,
        } = createTourDto;

        try {
            const tour = this.toursRepository.create({
                name,
                duration,
                maxTourGuider,
                maxGroupSize,
                difficulty,
                ratingsAverage: 0,
                ratingsQuantity: 0,
                price,
                summary,
                description,
                coverImage,
                startDate,
                endDate,
                tourType,
                tourLocation,
            });

            if (cities && cities.length > 0) {
                tour.cities = [];

                for (const city of cities) {
                    let tourCity = await this.tourCityRepository.findOne({
                        where: { name: city.name },
                    });

                    if (!tourCity) {
                        let tourCountry =
                            await this.tourCountryRepository.findOne({
                                where: { name: city.country.name },
                            });

                        if (!tourCountry) {
                            tourCountry = this.tourCountryRepository.create({
                                name: city.country.name,
                            });
                            await this.tourCountryRepository.save(tourCountry);
                        }

                        tourCity = this.tourCityRepository.create({
                            name: city.name,
                            country: tourCountry,
                        });
                        await this.tourCityRepository.save(tourCity);
                    }

                    tour.cities.push(tourCity);
                }
            }

            if (images && images.length > 0) {
                tour.images = [];
                for (const image of images) {
                    const tourImage = this.tourImageRepository.create({
                        image: image.image,
                    });

                    await this.tourImageRepository.save(tourImage);
                    tour.images.push(tourImage);
                }
            }
            const savedTour = await this.toursRepository.save(tour);

            return savedTour;
        } catch (error) {
            throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
        }
    }

    async deleteTour(id: string): Promise<void> {
        const result = await this.toursRepository.delete(id);

        if (result.affected === 0) {
            throw new HttpException(
                `Tour with id ${id} not found`,
                HttpStatus.NOT_FOUND
            );
        }
    }

    async updateTour(id: string, updateTourDto: UpdateTourDto): Promise<Tour> {
        const tour = await this.getTourById(id);
        if (!tour) {
            throw new HttpException(
                `Tour with id ${id} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        try {
            Object.assign(tour, updateTourDto);
            await this.toursRepository.save(tour);
            return tour;
        } catch (error) {
            throw new HttpException(
                `Error updating tour with id ${id}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
