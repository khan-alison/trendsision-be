import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CityEntity } from "src/entities/city.entity";
import { CountryEntity } from "src/entities/country.entity";
import { Repository } from "typeorm";
import { TourImageEntity } from "../entities/tour-image.entity";
import { TourEntity } from "../entities/tour.entity";
import { CreateTourDTO } from "./dtos/create-tour/create-tour.dto";
import { UpdateTourDto } from "./dtos/update-tour.dto";

@Injectable()
export class ToursService {
    constructor(
        @InjectRepository(TourImageEntity)
        private tourImageRepository: Repository<TourImageEntity>,
        @InjectRepository(TourEntity)
        private toursRepository: Repository<TourEntity>,
        @InjectRepository(CityEntity)
        private tourCityRepository: Repository<CityEntity>,
        @InjectRepository(CountryEntity)
        private tourCountryRepository: Repository<CountryEntity>
    ) {
        this.toursRepository = toursRepository;
        this.tourImageRepository = tourImageRepository;
    }

    async getAllTour(
        filter?: any,
        page?: number,
        limit?: number
    ): Promise<TourEntity[]> {
        const queryBuilder = this.toursRepository.createQueryBuilder("tour");

        if (filter) {
            if (filter.minPrice && filter.maxPrice) {
                queryBuilder.andWhere(
                    "tour.price BETWEEN :minPrice AND :maxPrice",
                    {
                        minPrice: filter.minPrice,
                        maxPrice: filter.maxPrice,
                    }
                );
            } else if (filter.minPrice) {
                queryBuilder.andWhere("tour.price >= :minPrice", {
                    minPrice: filter.minPrice,
                });
            } else if (filter.maxPrice) {
                queryBuilder.andWhere("tour.price <= :maxPrice", {
                    maxPrice: filter.maxPrice,
                });
            }

            if (filter.difficulty) {
                queryBuilder.andWhere("tour.difficulty = :difficulty", {
                    difficulty: filter.difficulty,
                });
            }

            if (filter.ratingsAverage) {
                queryBuilder.andWhere(
                    "tour.ratingsAverage >= :ratingsAverage",
                    { ratingsAverage: filter.ratingsAverage }
                );
            }

            if (filter.name) {
                queryBuilder.andWhere("tour.name LIKE :name", {
                    name: `%${filter.name}%`,
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
            } else if (filter.minDuration) {
                queryBuilder.andWhere("tour.duration >= :minDuration", {
                    minDuration: filter.minDuration,
                });
            } else if (filter.maxDuration) {
                queryBuilder.andWhere("tour.duration <= :maxDuration", {
                    maxDuration: filter.maxDuration,
                });
            }
        }

        if (page && limit) {
            queryBuilder.skip((page - 1) * limit).take(limit);
        }

        const tours = await queryBuilder
            .leftJoinAndSelect("tour.images", "image")
            .leftJoinAndSelect("tour.guiders", "guider")
            .leftJoinAndSelect("tour.customers", "customer")
            .leftJoinAndSelect("tour.city", "city")
            .getMany();

        return tours;
    }

    async getTourById(id: string): Promise<TourEntity> {
        const tour = await this.toursRepository.findOne({ where: { id } });

        if (!tour) {
            throw new HttpException(
                `Tour with id ${id} not found`,
                HttpStatus.NOT_FOUND
            );
        }
        return tour;
    }

    async createTour(createTourDto: CreateTourDTO): Promise<TourEntity> {
        const {
            name,
            duration,
            maxGroupSize,
            difficulty,
            ratingsAverage,
            ratingsQuantity,
            price,
            summary,
            description,
            coverImage,
            images,
            city,
            startDate,
            endDate,
        } = createTourDto;

        try {
            const tourCity = await this.tourCityRepository.findOne({
                where: { name: city.name },
            });

            const country = await this.tourCountryRepository.findOne({
                where: { name: city.country.name },
            });

            const tour = new TourEntity();
            tour.name = name;
            tour.duration = duration;
            tour.maxGroupSize = maxGroupSize;
            tour.difficulty = difficulty;
            tour.ratingsAverage = ratingsAverage;
            tour.ratingsQuantity = ratingsQuantity;
            tour.price = price;
            tour.summary = summary;
            tour.description = description;
            tour.coverImage = coverImage;
            tour.startDate = startDate;
            tour.endDate = endDate;
            tour.city = tourCity
                ? tourCity
                : this.tourCityRepository.create({
                      name: city.name,
                      country: country
                          ? country
                          : this.tourCountryRepository.create({
                                name: city.country.name,
                            }),
                  });

            const savedTour = await this.toursRepository.save(tour);

            if (images && images.length > 0) {
                const tourImages = images.map((image) => {
                    const tourImage = new TourImageEntity();
                    tourImage.image = image.image;
                    tourImage.tour = savedTour.id;
                    return tourImage;
                });
                await this.tourImageRepository.save(tourImages);
                savedTour.images = tourImages;
            }
            return savedTour;
        } catch (error) {
            throw error;
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

    async updateTour(
        id: string,
        updateTourDto: UpdateTourDto
    ): Promise<TourEntity> {
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
