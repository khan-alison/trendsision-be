import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseFilters,
} from "@nestjs/common";
import { CreateTourDTO } from "./dtos/create-tour.dto";
import { UpdateTourDto } from "./dtos/update-tour.dto";
import { Tour } from "../entities/tour.entity";
import { ToursService } from "./tours.service";
import { HttpExceptionFilter } from "src/utils/http_exception.filter";

@Controller("tours")
@UseFilters(new HttpExceptionFilter())
export class ToursController {
    constructor(private toursService: ToursService) {
        this.toursService = toursService;
    }

    @Get()
    async getAllTour(@Query() query: any): Promise<Tour[]> {
        const { page, limit } = query;

        const filter = {
            minPrice: query.minPrice,
            maxPrice: query.maxPrice,
            difficulty: query.difficulty,
            ratingsAverage: query.ratingsAverage,
            minDuration: query.minDuration,
            maxDuration: query.maxDuration,
        };

        return await this.toursService.getAllTour(
            filter,
            parseInt(page),
            parseInt(limit)
        );
    }

    @Get("/:id")
    getTourById(@Param("id") id: string): Promise<Tour> {
        return this.toursService.getTourById(id);
    }

    @Post()
    createTour(@Body() createTourDto: CreateTourDTO): Promise<Tour> {
        return this.toursService.createTour(createTourDto);
    }

    @Delete("/:id")
    deleteTour(@Param("id") id: string): Promise<void> {
        return this.toursService.deleteTour(id);
    }

    @Patch("/:id")
    async updateTour(
        @Param("id") id: string,
        @Body() partialTour: UpdateTourDto
    ): Promise<Tour> {
        return await this.toursService.updateTour(id, partialTour);
    }
}
