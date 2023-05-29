import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { Roles } from "src/decorators/roles.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RolesGuard } from "src/guards/roles.guard";
import { ROLES } from "src/utils/constants";
import { Tour } from "../entities/tour.entity";
import { CreateTourDTO } from "./dtos/create-tour/create-tour.dto";
import { UpdateTourDto } from "./dtos/update-tour.dto";
import { ToursService } from "./tours.service";

@Controller("tours")
@ApiTags("tours")
@ApiBearerAuth()
@SkipThrottle()
export class ToursController {
    constructor(private readonly toursService: ToursService) {}

    @Get()
    @ApiOperation({ summary: "Gets some public information.", security: [] })
    @ApiQuery({
        name: "minPrice",
        type: "number",
        required: false,
        description: "The minimum price of a tour.",
    })
    @ApiQuery({
        name: "maxPrice",
        type: "number",
        required: false,
        description: "The maximum price of a tour.",
    })
    @ApiQuery({
        name: "difficulty",
        type: "string",
        required: false,
        description: "The difficulty of a tour.",
    })
    @ApiQuery({
        name: "ratingsAverage",
        type: "number",
        required: false,
        description: "The average rating of a tour.",
    })
    @ApiQuery({
        name: "minDuration",
        type: "number",
        required: false,
        description: "The minimum duration of a tour.",
    })
    @ApiQuery({
        name: "maxDuration",
        type: "number",
        required: false,
        description: "The maximum duration of a tour.",
    })
    @ApiQuery({
        name: "name",
        type: "string",
        required: false,
        description: "The name of a tour.",
    })
    @ApiQuery({
        name: "page",
        type: "number",
        required: false,
        description: "The page number to retrieve.",
    })
    @ApiQuery({
        name: "limit",
        type: "number",
        required: false,
        description: "The maximum number of tours to retrieve.",
    })
    @ApiResponse({
        status: 200,
        description: "The retrieved tours.",
    })
    @ApiNoContentResponse({
        description: "This endpoint does not require a request body.",
    })
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

    @Get("/:id")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get a tour by ID." })
    @ApiParam({
        name: "id",
        type: "string",
        description: "The ID of the tour.",
    })
    @ApiResponse({
        status: 200,
        description: "The retrieved tour.",
    })
    getTourById(@Param("id") id: string): Promise<Tour> {
        return this.toursService.getTourById(id);
    }

    @Post("/create-tour")
    @Roles(ROLES.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Create a new tour." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiBody({
        type: CreateTourDTO,
        examples: {
            example1: {
                value: {
                    name: "Nashvilles",
                    duration: 9,
                    maxGroupSize: 12,
                    difficulty: "difficult",
                    ratingsAverage: 4.8,
                    ratingsQuantity: 28,
                    price: 2997,
                    summary: "Âm nhạc",
                    description: "Dù âm nhạc ",
                    coverImage:
                        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/5e/12/59/caption.jpg?w=700&h=500&s=1",
                    images: [
                        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/5e/12/59/caption.jpg?w=700&h=500&s=1",
                        "https://i.pinimg.com/236x/98/e1/85/98e18540736ba8cc7f7092ed52a06e43.jpg",
                        "https://i.pinimg.com/236x/26/39/f3/2639f3f2cef86f77bc088a5a383d8c65.jpg",
                    ],
                    startDate: "2021-03-23",
                    endDate: "2021-04-01",
                    city: {
                        id: "95979947-7cd2-4cd5-98f8-e13c1e585bfb",
                        name: "Nashville",
                        country: {
                            name: "America",
                        },
                    },
                },
                description: "Example of a valid object.",
            },
        },
    })
    createTour(@Body() createTourDto: CreateTourDTO): Promise<Tour> {
        return this.toursService.createTour(createTourDto);
    }

    @Delete("/:id")
    @Roles(ROLES.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Deletes a tour by ID." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiParam({
        name: "id",
        type: "string",
        description: "The ID of the tour.",
    })
    @ApiResponse({
        status: 204,
        description: "The tour was successfully deleted.",
    })
    deleteTour(@Param("id") id: string): Promise<void> {
        return this.toursService.deleteTour(id);
    }

    @Patch("/:id")
    @Roles(ROLES.ADMIN, ROLES.LEAD_GUIDE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Updates a tour by ID." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiParam({
        name: "id",
        type: "string",
        description: "The ID of the tour.",
    })
    @ApiBody({
        type: UpdateTourDto,
        examples: {
            example1: {
                value: {
                    ratingsAverage: 1,
                },
                description:
                    "Example of a valid object. You can update many field",
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: "The updated tour.",
        type: Tour,
    })
    async updateTour(
        @Param("id") id: string,
        @Body() updateTourDto: UpdateTourDto
    ): Promise<Tour> {
        return this.toursService.updateTour(id, updateTourDto);
    }
}
