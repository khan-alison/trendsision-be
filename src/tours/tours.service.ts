import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TourImage } from "../entities/tour-image.entity";
import { Tours } from "../entities/tour.entity";
import { CreateTourDTO } from "./dtos/create-tour.dto";
import { UpdateTourDto } from "./dtos/update-tour.dto";
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

@Injectable()
export class ToursService {
    constructor(
        @InjectRepository(TourImage)
        private tourImageRepository: Repository<TourImage>,
        @InjectRepository(Tours)
        private toursRepository: Repository<Tours>
    ) {
        this.toursRepository = toursRepository;
        this.tourImageRepository = tourImageRepository;
    }

    async getAllTour(
        filter?: any,
        page?: number,
        limit?: number
    ): Promise<Tours[]> {
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

        const tours = await queryBuilder.getMany();

        return tours;
    }

    async getTourById(id: string): Promise<Tours> {
        const tour = await this.toursRepository.findOne({ where: { id } });

        if (!tour) {
            throw new NotFoundException(`Tour with id ${id} not found`);
        }
        return tour;
    }

    async createTour(createTourDto: CreateTourDTO): Promise<Tours> {
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
            startDate,
            endDate,
        } = createTourDto;

        const tour = new Tours();
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

        const savedTour = await this.toursRepository.save(tour);

        if (images && images.length > 0) {
            const tourImages = images.map((image) => {
                const tourImage = new TourImage();
                tourImage.image = image.image;
                tourImage.tour = savedTour.id;
                return tourImage;
            });
            await this.tourImageRepository.save(tourImages);
            savedTour.images = tourImages;
        }

        return savedTour;
    }

    async deleteTour(id: string): Promise<void> {
        const result = await this.toursRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Tour with id ${id} not found`);
        }
    }

    async updateTour(id: string, updateTourDto: UpdateTourDto): Promise<Tours> {
        const tour = await this.getTourById(id);
        if (!tour) {
            throw new NotFoundException(`Tour with id ${id} not found`);
        }

        try {
            Object.assign(tour, updateTourDto);
            await this.toursRepository.save(tour);
            return tour;
        } catch (error) {
            throw new BadRequestException(`Error updating tour with id ${id}`);
        }
    }
}
