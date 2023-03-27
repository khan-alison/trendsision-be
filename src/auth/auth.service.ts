import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { scrypt } from "crypto";
import { User } from "src/entities/user.entity";
import { CreateUserDto } from "src/users/dtos/create_user_dto";
import { Repository } from "typeorm";
import { promisify } from "util";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
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

        const salt = await bcrypt.genSalt();
        const hash = (await promisify(scrypt)(password, salt, 32)) as Buffer;
        const result = salt + "." + hash.toString("hex");

        const newUser = this.userRepository.create({
            ...userData,
            email,
            password: result,
        });

        try {
            const savedUser = await this.userRepository.save(newUser);
            delete savedUser.password;
            return savedUser;
        } catch (error) {
            throw new Error("Internal server error");
        }
    }

    async signIn(email: string, password: string) {
        const [user] = await this.userRepository.find({ where: { email } });
        if (!user) {
            throw new NotFoundException(`User with ${email} not found`);
        }

        const [salt, storedHash] = user.password.split(".");
        const hash = (await promisify(scrypt)(password, salt, 32)) as Buffer;

        if (storedHash !== hash.toString("hex")) {
            throw new BadRequestException("Password is invalid");
        }

        return user;
    }
}
