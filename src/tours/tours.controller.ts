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
    UseGuards,
} from "@nestjs/common";
import { CreateTourDTO } from "./dtos/create-tour.dto";
import { UpdateTourDto } from "./dtos/update-tour.dto";
import { Tour } from "../entities/tour.entity";
import { ToursService } from "./tours.service";
import { HttpExceptionFilter } from "src/utils/http_exception.filter";
import { Roles } from "src/decorators/roles.decorator";
import { ROLES } from "src/utils/constants";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RolesGuard } from "src/guards/roles.guard";

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
            name: query.name,
        };

        return await this.toursService.getAllTour(
            filter,
            parseInt(page),
            parseInt(limit)
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get("/:id")
    @Roles(ROLES.ADMIN)
    getTourById(@Param("id") id: string): Promise<Tour> {
        return this.toursService.getTourById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @Roles(ROLES.ADMIN)
    createTour(@Body() createTourDto: CreateTourDTO): Promise<Tour> {
        return this.toursService.createTour(createTourDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete("/:id")
    @Roles(ROLES.ADMIN)
    deleteTour(@Param("id") id: string): Promise<void> {
        return this.toursService.deleteTour(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch("/:id")
    @Roles(ROLES.ADMIN, ROLES.LEAD_GUIDE)
    async updateTour(
        @Param("id") id: string,
        @Body() partialTour: UpdateTourDto
    ): Promise<Tour> {
        return await this.toursService.updateTour(id, partialTour);
    }
}
