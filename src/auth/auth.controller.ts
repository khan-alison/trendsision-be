import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Req,
    UseGuards,
    ValidationPipe,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserDecorator } from "src/decorators/current-user.decorator";
import { DeviceSessionEntity } from "src/entities/device-session.entity";
import { UserEntity } from "src/entities/user.entity";
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
import { SkipThrottle } from "@nestjs/throttler";

@Controller("auth")
@ApiTags("auth")
@SkipThrottle()
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
    ): Promise<UserEntity> {
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
    async signIn(
        @Req() req,
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
    async generateNewAccessJWT(
        @Body() refreshTokenDto: RefreshTokenDto,
        @Req() req
    ) {
        const { deviceId } = req;
        return await this.authService.generateNewAccessJWT(
            deviceId,
            refreshTokenDto
        );
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
        @UserDecorator() user: UserEntity,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<void> {
        await this.authService.changePassword(user.email, changePasswordDto);
    }

    @Get("device-session")
    @ApiOperation({ summary: "Get user device sessions" })
    @UseGuards(JwtAuthGuard)
    async getDeviceSessions(
        @UserDecorator() user: UserEntity
    ): Promise<DeviceSessionEntity[]> {
        return this.authService.getDeviceSessions(user.id);
    }

    @Post("logout")
    @ApiOperation({ summary: "Logout user from device" })
    async logout(@UserDecorator() user: UserEntity, @Req() req) {
        const { deviceId } = req;
        return this.authService.logout(user.id, deviceId);
    }
}
