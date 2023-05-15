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
    ApiNoContentResponse,
    ApiOkResponse,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { UserDecorator } from "src/decorators/current-user.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RolesGuard } from "src/guards/roles.guard";
import { ROLES } from "src/utils/constants";
import { UserEntity } from "../entities/user.entity";
import { UpdateUserDto } from "./dtos/update_user.dto";
import { UsersService } from "./users.service";
import { SkipThrottle } from "@nestjs/throttler";

@Controller("users")
@ApiTags("users")
@ApiBearerAuth()
@SkipThrottle()
export class UserController {
    constructor(private usersService: UsersService) {
        this.usersService = usersService;
    }

    @Get()
    @Roles(ROLES.ADMIN, ROLES.LEAD_GUIDE)
    @UseGuards(JwtAuthGuard, RolesGuard)
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
    getAllUsers(@Query() query: any): Promise<UserEntity[]> {
        const filter = {
            name: query.name,
            email: query.email,
        };
        return this.usersService.getAllUser(filter);
    }

    @Get("/my-info")
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({
        description: "Returns the current user's information.",
    })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    async getCurrentUserInfo(@UserDecorator() user: UserEntity) {
        return this.usersService.getCurrentUser(user.email);
    }

    @Get("/:id")
    @UseGuards(JwtAuthGuard)
    @ApiParam({
        name: "id",
        description: "The ID of the user.",
        type: "string",
    })
    @ApiOkResponse({
        description: "Returns the user with the specified ID.",
    })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    getUserById(@Param("id") id: string): Promise<UserEntity> {
        return this.usersService.getUserById(id);
    }

    @Patch("/:id")
    @Roles(ROLES.ADMIN, ROLES.LEAD_GUIDE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiParam({
        name: "id",
        description: "The ID of the user to update.",
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
    @ApiOkResponse({ description: "Returns the updated user." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    updateUser(
        @Param("id") id: string,
        @Body() newUserInfo: UpdateUserDto
    ): Promise<UserEntity> {
        return this.usersService.updateUser(id, newUserInfo);
    }

    @Delete("/:id")
    @Roles(ROLES.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiParam({
        name: "id",
        description: "The ID of the user to remove.",
        type: "string",
    })
    @ApiNoContentResponse({ description: "The user has been removed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    removeUser(
        @UserDecorator() user: UserEntity,
        @Param("id") id: string
    ): Promise<void> {
        return this.usersService.removeUser(user.email, id);
    }
}
