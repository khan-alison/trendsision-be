import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { scrypt } from "crypto";
import { User } from "src/entities/user.entity";
import { CreateUserDto } from "src/users/dtos/create_user_dto";
import { Repository } from "typeorm";
import { promisify } from "util";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { LoginDto } from "./dtos/login.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { MailService } from "./mail.service";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private mailService: MailService
    ) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException(`User with ${email} not exist yet`);
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
                throw new BadRequestException("Password is invalid");
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

    async signUp(userData: CreateUserDto): Promise<User> {
        const { email, password, passwordConfirm } = userData;

        const user = await this.userRepository.findOne({ where: { email } });

        if (user) {
            throw new ConflictException(`Email ${user.email} already exists`);
        }

        if (password !== passwordConfirm) {
            throw new BadRequestException(
                "Password and Confirm Password do not match"
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
            throw new NotFoundException(
                `User with ${loginDto.email} not found`
            );
        }

        if (await this.checkPassword(user.password, loginDto.password)) {
            throw new BadRequestException("Password is invalid");
        }

        const payload = { id: user.id, email: user.email, role: user.role };

        return { access_token: this.jwtService.sign(payload) };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.userRepository.findOne({
            where: { email: forgotPasswordDto.email },
        });

        if (!user) {
            throw new NotFoundException("Invalid email");
        }

        const payload = { id: user.id, email: user.email, role: user.role };
        const reset_token = this.jwtService.sign(payload, { expiresIn: "5m" });
        user.reset_token = reset_token;

        const forgotLink = `${process.env.APP_URL}/auth/reset-password?token=${reset_token}`;

        await this.userRepository.save(user);
        await this.mailService.send(user, forgotLink);
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
        try {
            const payload = await this.jwtService.verify(
                resetPasswordDto.token,
                {
                    ignoreExpiration: false,
                }
            );

            const user = await this.userRepository.findOne({
                where: { email: payload.email },
            });

            if (!user) {
                throw new NotFoundException("User not found");
            }

            user.password = await this.hashPassword(resetPasswordDto.password);
            user.reset_token = null;

            await this.userRepository.save(user);
        } catch (err) {
            if (err.expiredAt < Date.now()) {
                throw new UnauthorizedException("Reset token expired");
            } else {
                throw new BadRequestException("Invalid reset token");
            }
        }
    }
}
