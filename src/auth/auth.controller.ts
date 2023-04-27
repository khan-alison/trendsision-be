import {
    Body,
    Controller,
    Patch,
    Post,
    UseGuards,
    ValidationPipe,
} from "@nestjs/common";
import { User } from "src/entities/user.entity";
import { CreateUserDto } from "src/users/dtos/create_user_dto";
import { LocalAuthGuard } from "../guards/local-auth.guard";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { LoginDto } from "./dtos/login.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { ChangePasswordDto } from "./dtos/change-password.dto";
import { UserDecorator } from "src/decorators/current-user.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";

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
    async signIn(@Body() loginDto: LoginDto) {
        return this.authService.signIn(loginDto);
    }

    @Post("/forgot-password")
    async forgotPassword(
        @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto
    ): Promise<void> {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post("/reset-password")
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto
    ): Promise<void> {
        await this.authService.resetPassword(resetPasswordDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch("/change-password")
    async changePassword(
        @UserDecorator() user: User,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<void> {
        await this.authService.changePassword(user.email, changePasswordDto);
    }
}