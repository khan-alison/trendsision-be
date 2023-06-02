import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { UserDecorator } from "src/decorators/current-user.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RolesGuard } from "src/guards/roles.guard";
import { ROLES } from "src/utils/constants";
import { User } from "../entities/user.entity";
import { UpdateUserDto } from "./dtos/update_user.dto";
import { UsersService } from "./users.service";

@Controller("users")
@ApiTags("users")
@ApiBearerAuth()
@SkipThrottle()
export class UserController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles(ROLES.ADMIN, ROLES.LEAD_GUIDE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Get all user information." })
    @ApiQuery({
        name: "name",
        type: "string",
        required: false,
        description: "The name that you want to search",
    })
    @ApiQuery({
        name: "email",
        type: "string",
        required: false,
        description: "The email that you want to search",
    })
    @ApiResponse({
        status: 200,
        description: "The retrieved tours.",
    })
    @ApiUnauthorizedResponse({ description: "Unauthorized" })
    @ApiForbiddenResponse({ description: "Forbidden" })
    getAllUsers(@Query() query: any): Promise<User[]> {
        const filter = {
            name: query.name,
            email: query.email,
        };
        return this.usersService.getAllUser(filter);
    }

    @Get("/my-info")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get current information." })
    @ApiUnauthorizedResponse({ description: "Unauthorized" })
    @ApiResponse({
        status: 200,
        description: "Returns the current user information.",
    })
    async getCurrentUserInfo(@UserDecorator() user: User) {
        return this.usersService.getCurrentUser(user.email);
    }

    @Get("/:id")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get user by id." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiParam({
        name: "id",
        description: "The ID of the user.",
        type: "string",
    })
    @ApiResponse({
        status: 200,
        description: "Returns the user with the specified ID.",
    })
    getUserById(@Param("id") id: string): Promise<User> {
        return this.usersService.getUserById(id);
    }

    @Patch("/:id")
    @Roles(ROLES.ADMIN, ROLES.LEAD_GUIDE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Update user information." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiParam({
        name: "id",
        description: "The ID of the user you want to update.",
        type: "string",
    })
    @ApiBody({
        type: UpdateUserDto,
        examples: {
            example1: {
                value: {
                    name: "khanh",
                },
                description:
                    "Example of a valid object. You can update multiple field",
            },
            example2: {
                value: {
                    photo: "khanh.png",
                },
                description:
                    "Example of a valid object. You can update multiple field",
            },
        },
    })
    @ApiResponse({ status: 200, description: "Returns the updated user." })
    updateUser(
        @Param("id") id: string,
        @Body() newUserInfo: UpdateUserDto
    ): Promise<User> {
        return this.usersService.updateUser(id, newUserInfo);
    }

    @Delete("/:id")
    @Roles(ROLES.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Remove user." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiParam({
        name: "id",
        description: "The ID of the user you want to remove.",
        type: "string",
    })
    @ApiResponse({ status: 200, description: "Delete user successfully." })
    removeUser(
        @UserDecorator() user: User,
        @Param("id") id: string
    ): Promise<void> {
        return this.usersService.removeUser(user.email, id);
    }
}
