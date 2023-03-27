import { Body, Controller, Post, ValidationPipe } from "@nestjs/common";
import { User } from "src/entities/user.entity";
import { CreateUserDto } from "src/users/dtos/create_user_dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}
    @Post("/signup")
    async signUp(
        @Body(ValidationPipe) createUserDto: CreateUserDto
    ): Promise<User> {
        return this.authService.signUp(createUserDto);
    }

    @Post("/signin")
    async signIn(@Body() body: LoginDto) {
        const user = await this.authService.signIn(body.email, body.password);
        return user;
    }
}
