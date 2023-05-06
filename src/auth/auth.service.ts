import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { scrypt } from "crypto";
import { User } from "src/entities/user.entity";
import { CreateUserDto } from "src/users/dtos/create_user_dto";
import {
    generateAccessJWT,
    generateRefreshJWT,
    generateResetJWT,
    verifyRefreshJWT,
    verifyResetPasswordToken,
} from "src/utils/jwt";
import { Repository } from "typeorm";
import { promisify } from "util";
import { GenerateAccessJWTData, LoginResponseData } from "./auth.interface";
import { ChangePasswordDto } from "./dtos/change-password.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { LoginDto } from "./dtos/login.dto";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { MailService } from "./mail.service";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private mailService: MailService
    ) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new HttpException(
                `User with ${email} not exist yet`,
                HttpStatus.NOT_FOUND
            );
        }
        if (user) {
            const [salt, storedHash] = user.password.split("#");
            const hash = (await promisify(scrypt)(
                password,
                salt,
                32
            )) as Buffer;

            if (hash.toString("hex") === storedHash) {
                return user;
            } else {
                throw new HttpException(
                    "Password is invalid",
                    HttpStatus.BAD_REQUEST
                );
            }
        }
        return null;
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        const hash = (await promisify(scrypt)(password, salt, 32)) as Buffer;
        const hashedPassword = salt + "#" + hash.toString("hex");
        return hashedPassword;
    }

    async checkPassword(
        userPassword: string,
        hashedPassword: string
    ): Promise<boolean> {
        const [salt, storedHash] = hashedPassword.split("#");
        const hash = (await promisify(scrypt)(
            userPassword,
            salt,
            32
        )) as Buffer;
        return hash.toString("hex") === storedHash;
    }

    async generateResponseLoginData(user: User): Promise<LoginResponseData> {
        let accessToken;
        let refreshToken;
        let userData;
        try {
            userData = { ...user };
            delete userData.password;
            accessToken = generateAccessJWT(userData, {
                expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE_IN_SEC),
            });
            refreshToken = generateRefreshJWT(userData, {
                expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRE_IN_SEC),
            });
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        return {
            userData,
            accessToken,
            refreshToken,
        };
    }

    async generateNewAccessJWT(
        refreshTokenDto: RefreshTokenDto
    ): Promise<GenerateAccessJWTData> {
        const { refreshToken } = refreshTokenDto;

        let payload;
        try {
            payload = await verifyRefreshJWT(refreshToken);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }

        const accessToken = generateAccessJWT(payload);

        return { accessToken };
    }

    async signUp(userData: CreateUserDto): Promise<User> {
        const { email, password, passwordConfirm } = userData;

        const user = await this.userRepository.findOne({ where: { email } });

        if (user) {
            throw new HttpException(
                `Email ${user.email} already exists`,
                HttpStatus.CONFLICT
            );
        }

        if (password !== passwordConfirm) {
            throw new HttpException(
                "Password and Confirm Password do not match",
                HttpStatus.BAD_REQUEST
            );
        }

        const hashedPassword = await this.hashPassword(password);

        const newUser = this.userRepository.create({
            ...userData,
            email,
            password: hashedPassword,
        });

        try {
            const savedUser = await this.userRepository.save(newUser);
            delete savedUser.password;
            delete savedUser.reset_token;
            return savedUser;
        } catch (error) {
            throw new Error("Internal server error");
        }
    }

    async signIn(loginDto: LoginDto) {
        const [user] = await this.userRepository.find({
            where: { email: loginDto.email },
        });
        if (!user) {
            throw new HttpException(
                `User with ${loginDto.email} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        if (await this.checkPassword(user.password, loginDto.password)) {
            throw new HttpException(
                "Password is invalid",
                HttpStatus.BAD_REQUEST
            );
        }

        const { userData, accessToken, refreshToken } =
            await this.generateResponseLoginData(user);

        return {
            userData,
            accessToken,
            refreshToken,
        };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.userRepository.findOne({
            where: { email: forgotPasswordDto.email },
        });

        if (!user) {
            throw new HttpException("Invalid email", HttpStatus.NOT_FOUND);
        }

        const payload = { id: user.id, email: user.email, role: user.role };
        const reset_token = await generateResetJWT(payload, {
            expiresIn: "5m",
        });
        user.reset_token = reset_token;

        const forgotLink = `${process.env.APP_URL}/auth/reset-password?token=${reset_token}`;

        await this.userRepository.save(user);
        await this.mailService.send(user, forgotLink);
    }

    async changePassword(
        email: string,
        changePasswordDto: ChangePasswordDto
    ): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new HttpException(
                `User with email:${email} not found`,
                HttpStatus.NOT_FOUND
            );
        }
        const isOldPasswordValid = await this.checkPassword(
            changePasswordDto.oldPassword,
            user.password
        );

        if (!isOldPasswordValid) {
            throw new HttpException(
                "Invalid old password",
                HttpStatus.BAD_REQUEST
            );
        }

        user.password = await this.hashPassword(changePasswordDto.newPassword);

        await this.userRepository.save(user);
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
        try {
            const payload: any = await verifyResetPasswordToken(
                resetPasswordDto.token,
                {
                    ignoreExpiration: false,
                }
            );

            const user = await this.userRepository.findOne({
                where: { email: payload.email },
            });

            if (!user) {
                throw new HttpException(
                    `User ${user.email} not found`,
                    HttpStatus.NOT_FOUND
                );
            }

            user.password = await this.hashPassword(resetPasswordDto.password);
            user.reset_token = null;

            await this.userRepository.save(user);
        } catch (err) {
            if (err.expiredAt < Date.now()) {
                throw new HttpException(
                    "Reset token expired",
                    HttpStatus.UNAUTHORIZED
                );
            } else {
                throw new HttpException(
                    "Invalid reset token",
                    HttpStatus.BAD_REQUEST
                );
            }
        }
    }
}
