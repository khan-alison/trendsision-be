import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tour } from "./tour.entity";
import { CreateTourDTO } from "./dto/create-tour.dto";
import { TourImage } from "./tour-image.entity";

@Injectable()
export class ToursService {
    constructor(
        @InjectRepository(Tour)
        private taskRepository: Repository<Tour>
    ) {
        this.taskRepository = taskRepository;
    }

    async getTourById(id: string): Promise<Tour> {
        const tour = await this.taskRepository.findOneBy({ id });
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

        const result = this.taskRepository.create({
            ...createTourDto,
            images: tour.images,
        });

        await this.taskRepository.save(result);
        return result;
    }
}
