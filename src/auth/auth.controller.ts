import {
    Body,
    Controller,
    Get,
    Headers,
    Patch,
    Post,
    Req,
    UseGuards,
    ValidationPipe,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { UserDecorator } from "src/decorators/current-user.decorator";
import { DeviceSession } from "src/entities/device-session.entity";
import { User } from "src/entities/user.entity";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { CreateUserDto } from "src/users/dtos/create_user_dto";
import { LoginMetadata } from "src/utils/constants";
import { LocalAuthGuard } from "../guards/local-auth.guard";
import { AuthService } from "./auth.service";
import { ChangePasswordDto } from "./dtos/change-password.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { LoginDto } from "./dtos/login.dto";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";

@Controller("auth")
@ApiTags("auth")
@SkipThrottle()
export class AuthController {
    constructor(private authService: AuthService) {}
    @Post("/signup")
    @ApiOperation({ summary: "Create new account(user)." })
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
    async signUp(
        @Body(ValidationPipe) createUserDto: CreateUserDto
    ): Promise<User> {
        return this.authService.signUp(createUserDto);
    }

    @Post("/signin")
    @UseGuards(LocalAuthGuard)
    @ApiOperation({ summary: "Login." })
    @ApiBody({
        type: CreateUserDto,
        examples: {
            example1: {
                value: {
                    email: "khanh133@gmail.com",
                    password: "@Khanhnn13",
                },
                description: "Example of a valid sign-in object.",
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: "Login successfully",
    })
    async signIn(
        @Req() req: any,
        @Body() loginDto: LoginDto,
        @Headers() headers: Headers
    ) {
        const ipAddress = req.connection.remoteAddress;
        const ua = headers["user-agent"];
        const { deviceId } = req;
        const metaData: LoginMetadata = { ipAddress, ua, deviceId };
        return await this.authService.signIn(loginDto, metaData);
    }

    @Post("refresh-token")
    @ApiOperation({ summary: "Get new access token with refresh token." })
    @ApiResponse({
        status: 201,
        description: "Created new access token.",
    })
    @ApiBody({
        type: RefreshTokenDto,
        examples: {
            example1: {
                value: {
                    refreshToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhiZDYzY2FiLTUzMjQtNGU0Yi04Y2UyLTU0MGZjZTUyZTZhZCIsIm5hbWUiOiJraGFuaGR6YWkiLCJlbWFpbCI6ImtoYW5oMTMzQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwicGhvdG8iOiJhdmF0YXIuanBnIiwicmVzZXRfdG9rZW4iOm51bGwsImNyZWF0ZWRBdCI6IjIwMjMtMDUtMjVUMDQ6MDU6MzguMDAwWiIsInVwZGF0ZWRBdCI6IjIwMjMtMDUtMjVUMDQ6MDU6MzguMjg5WiIsImlhdCI6MTY4NDk4NzU1OCwiZXhwIjoxNjg1MDczOTU4fQ.pCACw8E_ajj-5owLAiXlrG7bsM3kXEmkh96WMHvaUNk",
                },
                description: "Example of a valid refresh token object.",
            },
        },
    })
    async generateNewAccessJWT(
        @Body() refreshTokenDto: RefreshTokenDto,
        @Req() req: any
    ) {
        const { deviceId } = req;
        return await this.authService.generateNewAccessJWT(
            deviceId,
            refreshTokenDto
        );
    }

    @Post("/forgot-password")
    @ApiOperation({
        summary:
            "Send token to reset your password to the mail that you provide.",
    })
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
    @ApiResponse({
        status: 200,
        description: "Sent token to mail that you provide.",
    })
    async forgotPassword(
        @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto
    ): Promise<void> {
        await this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post("/reset-password")
    @ApiOperation({
        summary: "Use the token that send to your mail to reset password.",
    })
    @ApiBody({
        type: CreateUserDto,
        examples: {
            example1: {
                value: {
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2OTIxNDM0LTRiNDMtNDI0My1hN2I5LWVjNWE4Y2Y4MzBkMiIsImVtYWlsIjoia2hhbmgxMzFAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjgzMzM5NDM5LCJleHAiOjE2ODMzMzk3Mzl9.gcje2xVT5bkUxnf4Y0_bCVZlM9PzGzk6uKb1fibSSDA",
                    newPassword: "@Khanhnn13",
                },
                description: "Example of a valid object.",
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: "Change password successfully.",
    })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto
    ): Promise<void> {
        await this.authService.resetPassword(resetPasswordDto);
    }

    @Patch("/change-password")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Change password." })
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
    @ApiResponse({
        status: 200,
        description: "Change password successfully.",
    })
    async changePassword(
        @UserDecorator() user: User,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<void> {
        await this.authService.changePassword(user.email, changePasswordDto);
    }

    @Get("device-session")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get user device sessions" })
    @ApiResponse({
        status: 200,
        description: "Action successfully.",
    })
    async getDeviceSessions(
        @UserDecorator() user: User
    ): Promise<DeviceSession[]> {
        return this.authService.getDeviceSessions(user.id);
    }

    @Post("logout")
    @ApiOperation({ summary: "Logout user from device" })
    @ApiResponse({
        status: 200,
        description: "Logout successfully.",
    })
    async logout(@UserDecorator() user: User, @Req() req: any) {
        const { deviceId } = req;
        return this.authService.logout(user.id, deviceId);
    }
}
