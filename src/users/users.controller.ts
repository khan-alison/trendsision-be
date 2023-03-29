import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    UseGuards,
} from "@nestjs/common";
import { Roles } from "src/decorators/roles.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RolesGuard } from "src/guards/roles.guard";
import { ROLES } from "src/utils/constants";
// import { LocalAuthGuard } from "src/auth/local-auth.guard";
import { User } from "../entities/user.entity";
import { UpdateUserDto } from "./dtos/update_user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UserController {
    constructor(private usersService: UsersService) {
        this.usersService = usersService;
    }

    @Get()
    getAllUsers(): Promise<User[]> {
        return this.usersService.getAllUser();
    }

    @UseGuards(JwtAuthGuard)
    @Get("/:id")
    getUserById(@Param("id") id: string): Promise<User> {
        return this.usersService.getUserById(id);
    }

    @Patch("/:id")
    updateUser(
        @Param("id") id: string,
        @Body() newUserInfo: UpdateUserDto
    ): Promise<User> {
        return this.updateUser(id, newUserInfo);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete("/:id")
    @Roles(ROLES.ADMIN)
    removeUser(@Param("id") id: string): Promise<void> {
        return this.usersService.removeUser(id);
    }
}
