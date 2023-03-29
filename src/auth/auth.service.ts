import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
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
        private userRepository: Repository<User>,
        private jwtService: JwtService
    ) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            const [salt, storedHash] = user.password.split("#");
            const hash = (await promisify(scrypt)(
                password,
                salt,
                32
            )) as Buffer;

            if (hash.toString("hex") === storedHash) {
                return user;
            }
        }
        return null;
    }

    async signUp(userData: CreateUserDto): Promise<User> {
        // user fill information that they want
        const { email, password, passwordConfirm } = userData;

        // check if that information already existed
        const user = await this.userRepository.findOne({ where: { email } });

        if (user) {
            throw new ConflictException(`Email ${user.email} already exists`);
        }

        // Check the confirm password and password are same
        if (password !== passwordConfirm) {
            throw new BadRequestException(
                "Password and Confirm Password do not match"
            );
        }

        // Hash the password
        const salt = await bcrypt.genSalt();
        const hash = (await promisify(scrypt)(password, salt, 32)) as Buffer;
        const result = salt + "#" + hash.toString("hex");

        // Create new instance of that information that user give
        const newUser = this.userRepository.create({
            ...userData,
            email,
            password: result,
        });

        // Check and save that information to the DB
        try {
            const savedUser = await this.userRepository.save(newUser);
            delete savedUser.password;
            return savedUser;
        } catch (error) {
            throw new Error("Internal server error");
        }
    }

    async signIn(email: string, userPassword: string) {
        // Get information that user fill in
        const [user] = await this.userRepository.find({ where: { email } });
        //Check if that user are already existed
        if (!user) {
            throw new NotFoundException(`User with ${email} not found`);
        }

        // Unhash the password of the user that we found in the DB
        const [salt, storedHash] = user.password.split("#");
        const hash = (await promisify(scrypt)(
            userPassword,
            salt,
            32
        )) as Buffer;

        // Check the password unhash of the user that we found on DB with the password that user give us
        if (storedHash !== hash.toString("hex")) {
            throw new BadRequestException("Password is invalid");
        }

        // This will pass through jwt sign and then other route will use this to check permission
        const payload = { id: user.id, email: user.email, role: user.role };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        const { password, role, ...result } = user;

        // Return the access token that allow user can access some route that user's role allow
        return { access_token: this.jwtService.sign(payload) };
    }
}
