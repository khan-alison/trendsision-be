import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ToursService } from "./tours.service";
import { Tour } from "./tour.entity";
import { CreateTourDTO } from "./dto/create-tour.dto";

@Controller("tours")
export class ToursController {
    constructor(private toursService: ToursService) {
        this.toursService = toursService;
    }

    @Get("/:id")
    getTourById(@Param("id") id: string): Promise<Tour> {
        return this.toursService.getTourById(id);
    }

    @Post()
    createTour(@Body() createTourDto: CreateTourDTO): Promise<Tour> {
        return this.toursService.createTour(createTourDto);
    }
}
