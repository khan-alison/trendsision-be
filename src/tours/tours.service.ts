import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTourDTO } from "./dtos/create-tour.dto";
import { UpdateTourDto } from "./dtos/update-tour.dto";
import { TourImage } from "./tour-image.entity";
import { Tour } from "./tour.entity";

@Injectable()
export class ToursService {
    constructor(
        @InjectRepository(Tour)
        private tourRepository: Repository<Tour>
    ) {
        this.tourRepository = tourRepository;
    }

    async getAllTour(
        filter?: any,
        page?: number,
        limit?: number
    ): Promise<Tour[]> {
        const queryBuilder = this.tourRepository.createQueryBuilder("tour");

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

    async getTourById(id: string): Promise<Tour> {
        const tour = await this.tourRepository.findOneBy({ id });
        if (!tour) {
            throw new NotFoundException(`Task with id ${id} not found`);
        } else {
            return tour;
        }
    }

    async createTour(createTourDto: CreateTourDTO): Promise<Tour> {
        const tour = Tour.create();
        tour.images = createTourDto.images.map((image) =>
            TourImage.create({ ...image })
        );

        const result = this.tourRepository.create({
            ...createTourDto,
            images: tour.images,
        });

        await this.tourRepository.save(result);
        return result;
    }

    async deleteTour(id: string): Promise<void> {
        const result = await this.tourRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Task with id ${id} not found`);
        }
    }

    async updateTour(id: string, updateTourDto: UpdateTourDto): Promise<Tour> {
        const tour = await this.getTourById(id);

        if (!tour) {
            throw new NotFoundException(`Tour with id ${id} not found`);
        }

        Object.assign(tour, updateTourDto);
        await this.tourRepository.save(tour);

        return tour;
    }
}
