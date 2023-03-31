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
import { UserDecorator } from "src/decorators/current-user.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RolesGuard } from "src/guards/roles.guard";
import { ROLES } from "src/utils/constants";
import { User } from "../entities/user.entity";
import { UpdateUserDto } from "./dtos/update_user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UserController {
    constructor(private usersService: UsersService) {
        this.usersService = usersService;
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getAllUsers(@Query() query: any): Promise<User[]> {
        const filter = {
            name: query.name,
            email: query.email,
        };
        return this.usersService.getAllUser(filter);
    }

    @UseGuards(JwtAuthGuard)
    @Get("/my-info")
    async getCurrentUserInfo(@UserDecorator() user: User) {
        return this.usersService.getCurrentUser(user.email);
    }

    @UseGuards(JwtAuthGuard)
    @Get("/:id")
    getUserById(@Param("id") id: string): Promise<User> {
        return this.usersService.getUserById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch("/:id")
    @Roles(ROLES.ADMIN, ROLES.LEAD_GUIDE)
    updateUser(
        @Param("id") id: string,
        @Body() newUserInfo: UpdateUserDto
    ): Promise<User> {
        return this.usersService.updateUser(id, newUserInfo);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete("/:id")
    @Roles(ROLES.ADMIN)
    removeUser(
        @UserDecorator() user: User,
        @Param("id") id: string
    ): Promise<void> {
        return this.usersService.removeUser(user.email, id);
    }
}
