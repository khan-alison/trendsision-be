import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { scrypt } from "crypto";
import { DeviceSession } from "src/entities/device-session.entity";
import { User } from "src/entities/user.entity";
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
import { Session } from "src/utils/interface";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(DeviceSession)
        private deviceSessionRepository: Repository<DeviceSession>,
        private mailService: MailService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new HttpException(
                `User with ${email} not exist yet`,
                HttpStatus.NOT_FOUND
            );
        }

        const [salt, storedHash] = user.password.split("#");
        const hashBuffer = (await promisify(scrypt)(
            password,
            salt,
            32
        )) as Buffer;
        const hash = hashBuffer.toString("hex");

        if (hash !== storedHash) {
            throw new HttpException(
                "Password is invalid",
                HttpStatus.BAD_REQUEST
            );
        }

        return user;
    }

    async isEmailInUse(email: string): Promise<boolean> {
        const isEmailInUse = await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email })
            .getOne();

        return !!isEmailInUse;
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

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        if (!user) {
            throw new HttpException(
                `User with email:${email} doesn't existed`,
                HttpStatus.NOT_FOUND
            );
        }

        return user;
    }

    async getUserById(id: string) {
        const user = await this.userRepository.findOne({
            where: { id: id },
        });

        if (!user) {
            throw new HttpException(
                `User with ${id} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        return user;
    }

    isDifferentUser(session: Session, user: User) {
        return session.user.id !== user.id;
    }

    hideSensitiveUserData(user: User) {
        delete user.password;
        delete user.resetToken;
    }

    async getSession(deviceId: string, userId?: string, refreshToken?: string) {
        const queryBuilder = this.deviceSessionRepository
            .createQueryBuilder("session")
            .leftJoinAndSelect("session.user", "user")
            .select(["session", "user.id"])
            .where("session.deviceId = :deviceId", { deviceId });

        if (userId) {
            queryBuilder.andWhere("session.user.id = :userId", { userId });
        }

        if (refreshToken) {
            queryBuilder.andWhere("session.refreshToken = :refreshToken", {
                refreshToken,
            });
        }

        return await queryBuilder.getOne();
    }

    async createSession(user: User, loginMetaData: LoginMetadata) {
        const { userData, accessToken, refreshToken } =
            await this.generateResponseLoginData(user);

        const session = await this.getSession(loginMetaData.deviceId, user.id);
        const refreshTokenExpireAtMs =
            Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRE_IN_SEC) * 1000;
        const newDevice = new DeviceSession();

        newDevice.createdAt = new Date(Date.now());
        newDevice.refreshToken = refreshToken;
        newDevice.deviceId = loginMetaData.deviceId;
        newDevice.ipAddress = session
            ? session.ipAddress
            : loginMetaData.ipAddress;
        newDevice.ua = loginMetaData.ua;
        newDevice.expiredAt = new Date(refreshTokenExpireAtMs);
        newDevice.userId = userData.id;

        await this.deviceSessionRepository.save(newDevice);

        return {
            userData,
            accessToken,
            refreshToken,
            loginMetaData,
        };
    }

    getKeyCache(userId: string, deviceId: string): string {
        return `sk_${userId}_${deviceId}`;
    }

    async generateResponseLoginData(user: User): Promise<LoginResponseData> {
        const userData = { ...user };
        delete userData.resetToken;
        delete userData.password;
        delete userData.createdAt;
        delete userData.updatedAt;
        let accessToken: string;
        let refreshToken: string;

        try {
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

    async generateNewAccessJWT(
        deviceId: string,
        refreshTokenDto: RefreshTokenDto
    ): Promise<GenerateAccessJWTData> {
        const { refreshToken } = refreshTokenDto;
        const session: any = await this.getSession(
            deviceId,
            undefined,
            refreshToken
        );

        if (!session || session.expiredAt < new Date()) {
            throw new HttpException(
                "Refresh token invalid",
                HttpStatus.UNAUTHORIZED
            );
        }
        let payload: any;
        try {
            payload = await verifyRefreshJWT(refreshToken);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }

        delete payload.exp;
        delete payload.iat;

        const accessToken = generateAccessJWT(payload, { expiresIn: 1800 });

        return { accessToken };
    }

    async saveUser(user: User) {
        try {
            await this.userRepository.save(user);
        } catch (error) {
            throw new HttpException(
                "Failed to save user",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async signUp(userData: CreateUserDto): Promise<User> {
        const {
            dateOfBirth,
            firstName,
            lastName,
            email,
            password,
            passwordConfirm,
        } = userData;

        if (await this.isEmailInUse(email)) {
            throw new HttpException(
                `Email ${email} already exists`,
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

        let savedUser: User;
        const newUser = this.userRepository.create({
            ...userData,
            firstName,
            lastName,
            email,
            dateOfBirth,
            password: hashedPassword,
        });

        // Starts a new database transaction, performing operations as a unit;
        // Rolls back all changes if an error occurs, keeping the database unchanged.
        await this.userRepository.manager.transaction(async (entityManager) => {
            try {
                savedUser = await entityManager.save(newUser);
            } catch (error) {
                throw new Error(`Internal server error: ${error.message}`);
            }
        });

        this.hideSensitiveUserData(savedUser);
        return savedUser;
    }

    async signIn(loginDto: LoginDto, loginMetaData: LoginMetadata) {
        const user = await this.getUserByEmail(loginDto.email);

        if (await this.checkPassword(user.password, loginDto.password)) {
            throw new HttpException(
                "Password is invalid",
                HttpStatus.BAD_REQUEST
            );
        }

        const session = await this.getSession(
            loginMetaData.deviceId,
            user.id,
            undefined
        );

        if (session) {
            if (new Date(session.expiredAt).getTime() < Date.now()) {
                await this.deviceSessionRepository.delete(session.id);
                throw new HttpException(
                    "Session expired",
                    HttpStatus.UNAUTHORIZED
                );
            }
        }

        if (!session || this.isDifferentUser(session, user)) {
            return await this.createSession(user, loginMetaData);
        }

        return {
            refreshToken: session.refreshToken,
        };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.getUserByEmail(forgotPasswordDto.email);

        const payload = { id: user.id, email: user.email, role: user.role };
        const reset_token = generateResetJWT(payload, {
            expiresIn: "5m",
        });
        user.resetToken = reset_token;

        const forgotLink = `${process.env.APP_URL}/auth/reset-password?token=${reset_token}`;

        await this.saveUser(user);
        await this.mailService.send(user, forgotLink);
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
        try {
            const payload: any = await verifyResetPasswordToken(
                resetPasswordDto.token,
                {
                    ignoreExpiration: false,
                }
            );

            const user = await this.getUserByEmail(payload.email);

            user.password = await this.hashPassword(
                resetPasswordDto.newPassword
            );
            user.resetToken = null;

            await this.saveUser(user);
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

    async changePassword(
        email: string,
        changePasswordDto: ChangePasswordDto
    ): Promise<void> {
        const user = await this.getUserByEmail(email);
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

        await this.saveUser(user);
    }

    async logout(userId: string, deviceId: string) {
        const session: any = await this.getSession(deviceId);

        const user = await this.getUserById(userId);

        if (!session || !user) {
            throw new HttpException("You need to login", HttpStatus.FORBIDDEN);
        }
        const keyCache = this.getKeyCache(userId, session.id);

        await this.cacheManager.del(keyCache);
        await this.deviceSessionRepository.delete(session.id);
        return {
            message: "Logout success",
            status: 200,
            sessionId: deviceId,
        };
    }
}
