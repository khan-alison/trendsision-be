import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
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
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
    constructor(private authService: AuthService) {}
    @Post("/signup")
    @ApiResponse({
        status: 201,
        description: "Your account successfully created.",
    })
    @ApiBody({
        type: CreateUserDto,
        examples: {
            example1: {
                value: {
                    email: "khanh133@gmail.com",
                    password: "@Khanhnn13",
                    passwordConfirm: "@Khanhnn13",
                },
                description: "Example of a valid sign-up object.",
            },
        },
    })
    @ApiOperation({ summary: "Create new account(user)." })
    @HttpCode(HttpStatus.OK)
    async signUp(
        @Body(ValidationPipe) createUserDto: CreateUserDto
    ): Promise<User> {
        return this.authService.signUp(createUserDto);
    }

    @Post("/signin")
    @UseGuards(LocalAuthGuard)
    @ApiBody({
        type: CreateUserDto,
        examples: {
            example1: {
                value: {
                    email: "khanh133@gmail.com",
                    password: "@Khanhnn13",
                },
                description: "Example of a valid sign-up object.",
            },
        },
    })
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() loginDto: LoginDto) {
        return await this.authService.signIn(loginDto);
    }

    @Post("refresh-token")
    @ApiBody({
        type: CreateUserDto,
        examples: {
            example1: {
                value: {
                    email: "khanh133@gmail.com",
                    password: "@Khanhnn13",
                },
                description: "Example of a valid sign-up object.",
            },
        },
    })
    @HttpCode(HttpStatus.CREATED)
    async generateNewAccessJWT(@Body() refreshTokenDto: RefreshTokenDto) {
        return await this.authService.generateNewAccessJWT(refreshTokenDto);
    }

    @Post("/forgot-password")
    @ApiBody({
        type: CreateUserDto,
        examples: {
            example1: {
                value: {
                    email: "khanh133@gmail.com",
                },
                description: "Example of a valid object.",
            },
        },
    })
    async forgotPassword(
        @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto
    ): Promise<void> {
        await this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post("/reset-password")
    @ApiBody({
        type: CreateUserDto,
        examples: {
            example1: {
                value: {
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2OTIxNDM0LTRiNDMtNDI0My1hN2I5LWVjNWE4Y2Y4MzBkMiIsImVtYWlsIjoia2hhbmgxMzFAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjgzMzM5NDM5LCJleHAiOjE2ODMzMzk3Mzl9.gcje2xVT5bkUxnf4Y0_bCVZlM9PzGzk6uKb1fibSSDA",
                    password: "@Khanhnn13",
                },
                description: "Example of a valid sign-up object.",
            },
        },
    })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto
    ): Promise<void> {
        await this.authService.resetPassword(resetPasswordDto);
    }

    @Patch("/change-password")
    @UseGuards(JwtAuthGuard)
    @ApiBody({
        type: CreateUserDto,
        examples: {
            example1: {
                value: {
                    oldPassword: "@Khanhnn13",
                    newPassword: "@Khanhnn131",
                },
                description: "Example of a valid sign-up object.",
            },
        },
    })
    @ApiBody({
        type: CreateUserDto,
        examples: {
            example1: {
                value: {
                    oldPassword: "@Khanhnn13",
                    newPassword: "@Khanhnn131",
                },
                description: "Example of a valid object.",
            },
        },
    })
    async changePassword(
        @UserDecorator() user: User,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<void> {
        await this.authService.changePassword(user.email, changePasswordDto);
    }
}
