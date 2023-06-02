import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
    ValidationPipe,
} from "@nestjs/common";
import { TourRegisterService } from "./tour-register.service";
import {
    ApiNoContentResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
} from "@nestjs/swagger";
import { RegisterTourDTO } from "./dtos/registerTour.dto";
import { Roles } from "src/decorators/roles.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RolesGuard } from "src/guards/roles.guard";
import { ROLES } from "src/utils/constants";
import { UserDecorator } from "src/decorators/current-user.decorator";
import { User } from "src/entities/user.entity";
import { TourRegistration } from "src/entities/tour-registration.entity";
import { SkipThrottle } from "@nestjs/throttler";

@Controller("tour-register")
@SkipThrottle()
export class TourRegisterController {
    constructor(private readonly tourRegisterService: TourRegisterService) {}

    @Get("")
    @ApiOperation({ summary: "Gets some public information.", security: [] })
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
    async getAllRegistration(
        @Query("tourId") tourId: string,
        @Query() query: any
    ): Promise<TourRegistration[]> {
        const { page, limit } = query;

        return await this.tourRegisterService.getAllRegistrationByTourId(
            tourId,
            parseInt(page),
            parseInt(limit)
        );
    }

    @Post("/:id")
    @Roles(ROLES.GUIDE, ROLES.USER, ROLES.LEAD_GUIDE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Register to join some tour" })
    @ApiParam({
        name: "id",
        description:
            "The ID of the tour that you want to book or register for tour guide.",
        type: "string",
    })
    @ApiResponse({
        status: 201,
        description: "Registration successfully.",
    })
    async registerTour(
        @Param("id") id: string,
        @UserDecorator() user: User,
        @Body(ValidationPipe) registerTourDto: RegisterTourDTO
    ): Promise<TourRegistration> {
        return this.tourRegisterService.registerTour(id, registerTourDto, user);
    }

    @Get("/my-purchases")
    async getAllMyTourRegistration(
        @UserDecorator() user: User
    ): Promise<TourRegistration[]> {
        return this.tourRegisterService.getAllMyTourRegistration(user.id);
    }

    @Delete("/:id")
    async cancelTourRegistration(
        @Param("id") id: string,
        @UserDecorator() user: User
    ): Promise<void> {
        //TODO: Return response when delete successfully
        // add try catch into all route
        return this.tourRegisterService.cancelTourRegistration(id, user.id);
    }
}
