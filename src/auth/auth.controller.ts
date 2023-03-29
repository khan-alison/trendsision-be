import {
    Body,
    Controller,
    Post,
    UseGuards,
    ValidationPipe,
} from "@nestjs/common";
import { User } from "src/entities/user.entity";
import { CreateUserDto } from "src/users/dtos/create_user_dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { LocalAuthGuard } from "../guards/local-auth.guard";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}
    @Post("/signup")
    async signUp(
        @Body(ValidationPipe) createUserDto: CreateUserDto
    ): Promise<User> {
        return this.authService.signUp(createUserDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post("/signin")
    async signIn(@Body() body: LoginDto) {
        const { email, password } = body;
        return this.authService.signIn(email, password);
    }
}
