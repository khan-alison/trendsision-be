import { UsersService } from "./users.service";
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from "@nestjs/common";
import { CreateUserDto } from "./dtos/create_user_dto";
import { User } from "./user.entity";
import { UpdateUserDto } from "./dtos/update_user.dto";

@Controller("users")
export class UserController {
    constructor(private usersService: UsersService) {
        this.usersService = usersService;
    }

    @Get()
    getAllUsers(): Promise<User[]> {
        return this.usersService.getAllUser();
    }

    @Get("/:id")
    getUserById(@Param("id") id: string): Promise<User> {
        return this.usersService.getUserById(id);
    }

    @Post()
    createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.createUser(createUserDto);
    }

    @Patch("/:id")
    updateUser(
        @Param("id") id: string,
        @Body() newUserInfo: UpdateUserDto
    ): Promise<User> {
        return this.updateUser(id, newUserInfo);
    }

    @Delete("/:id")
    removeUser(@Param("id") id: string): Promise<void> {
        return this.usersService.removeUser(id);
    }
}
