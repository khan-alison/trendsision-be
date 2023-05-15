import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { scrypt } from "crypto";
import { DeviceSessionEntity } from "src/entities/device-session.entity";
import { UserEntity } from "src/entities/user.entity";
import { CreateUserDto } from "src/users/dtos/create_user_dto";
import { LoginMetadata } from "src/utils/constants";
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
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(DeviceSessionEntity)
        private deviceSessionRepository: Repository<DeviceSessionEntity>,
        private mailService: MailService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async validateUser(email: string, password: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new HttpException(
                `User with ${email} not exist yet`,
                HttpStatus.NOT_FOUND
            );
        }

        const [salt, storedHash] = user.password.split("#");
        const hash = (await promisify(scrypt)(password, salt, 32)) as Buffer;

        if (hash.toString("hex") !== storedHash) {
            throw new HttpException(
                "Password is invalid",
                HttpStatus.BAD_REQUEST
            );
        }

        return user;
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

    async generateResponseLoginData(
        user: UserEntity
    ): Promise<LoginResponseData> {
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
            accessToken,
            refreshToken,
            userData,
        };
    }

    async logout(userId: string, deviceId: string) {
        const session: any = await this.deviceSessionRepository
            .createQueryBuilder("session")
            .leftJoinAndSelect("session.user", "user")
            .select(["session", "user.id"])
            .where("session.deviceId = :deviceId", { deviceId })
            .getOne();

        const user = await this.userRepository
            .createQueryBuilder("user")
            .where("user.id = :id", { id: userId })
            .getOne();

        if (!session || !user) {
            throw new HttpException("You need to login", HttpStatus.FORBIDDEN);
        }
        const keyCache = this.getKeyCache(userId, session.id);

        await this.cacheManager.set(keyCache, null);
        await this.deviceSessionRepository.delete(session.id);
        return {
            message: "Logout success",
            status: 200,
            sessionId: deviceId,
        };
    }

    async getDeviceSessions(userId: string) {
        return this.deviceSessionRepository.find({
            where: {
                id: userId,
            },
            select: [
                "id",
                "deviceId",
                "createdAt",
                "ipAddress",
                "name",
                "ua",
                "updatedAt",
            ],
        });
    }

    async generateNewAccessJWT(
        deviceId: string,
        refreshTokenDto: RefreshTokenDto
    ): Promise<GenerateAccessJWTData> {
        const { refreshToken } = refreshTokenDto;
        const session: any = await this.deviceSessionRepository
            .createQueryBuilder("session")
            .select("session", "user.id")
            .leftJoinAndSelect("session.user", "user")
            .where("session.refreshToken = :refreshToken", { refreshToken })
            .andWhere("session.deviceId = :deviceId", { deviceId })
            .getOne();

        if (
            !session ||
            new Date(session.expiredAt).valueOf() < new Date().valueOf()
        ) {
            throw new HttpException(
                "Refresh token invalid",
                HttpStatus.UNAUTHORIZED
            );
        }
        let payload;
        try {
            payload = await verifyRefreshJWT(refreshToken);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }

        delete payload.exp;
        delete payload.iat;

        const accessToken = generateAccessJWT(payload, { expiresIn: 60 });

        return { accessToken };
    }

    async signUp(userData: CreateUserDto): Promise<UserEntity> {
        const { email, password, passwordConfirm } = userData;

        const user = await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email })
            .getOne();

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

    async signIn(loginDto: LoginDto, loginMetaData: LoginMetadata) {
        const user = await this.userRepository.findOne({
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

        const session = await this.deviceSessionRepository.findOne({
            where: { deviceId: loginMetaData.deviceId },
        });

        if (session && new Date(session.expiredAt).getTime() < Date.now()) {
            await this.deviceSessionRepository.delete(session.id);
        }

        if (!session || session.user.id !== user.id) {
            const refreshTokenExpireAtMs =
                Date.now() +
                Number(process.env.REFRESH_TOKEN_EXPIRE_IN_SEC) * 1000;

            const newDevice = new DeviceSessionEntity();
            newDevice.createdAt = new Date(Date.now());
            newDevice.refreshToken = session
                ? session.refreshToken
                : refreshToken;
            newDevice.deviceId = loginMetaData.deviceId;
            newDevice.ipAddress = session
                ? session.ipAddress
                : loginMetaData.ipAddress;
            newDevice.ua = loginMetaData.ua;
            newDevice.expiredAt = new Date(refreshTokenExpireAtMs);
            newDevice.user = user;

            await this.deviceSessionRepository.save(newDevice);
        } else {
            return {
                refreshToken: session.refreshToken,
            };
        }

        return {
            userData,
            accessToken,
            refreshToken,
            loginMetaData,
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

    getKeyCache(userId, deviceId): string {
        return `sk_${userId}_${deviceId}`;
    }
}
