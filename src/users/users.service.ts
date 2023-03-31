import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { UpdateUserDto } from "./dtos/update_user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersService: Repository<User>
    ) {
        this.usersService = usersService;
    }

    async getAllUser(filter?: any): Promise<User[]> {
        const queryBuilder = this.usersService.createQueryBuilder("user");
        if (filter) {
            if (filter.name) {
                queryBuilder.andWhere("user.name LIKE :name", {
                    name: `%${filter.name}%`,
                });
            }

            if (filter.email) {
                queryBuilder.andWhere("user.email LIKE :email", {
                    email: `%${filter.email}%`,
                });
            }
        }
        const users = await queryBuilder.getMany();

        return users;
    }

    async getCurrentUser(email: string): Promise<User> {
        const user = this.getUserByEmail(email);
        return user;
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.usersService.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        } else {
            return user;
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        const user = await this.usersService.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException(`User with id ${email} not found`);
        } else {
            return user;
        }
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.usersService.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        Object.assign(user, updateUserDto);
        await this.usersService.save(user);
        return user;
    }

    async removeUser(email: string, id: string): Promise<void> {
        const sendRequestUser = await this.usersService.findOne({
            where: { email },
        });
        const wantDeleteUser = await this.usersService.findOne({
            where: { id },
        });

        if (!wantDeleteUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        if (wantDeleteUser?.id === sendRequestUser.id) {
            throw new BadRequestException("You can't delete your account");
        }

        const deletedUser = await this.usersService.delete(id);
        if (deletedUser.affected === 0) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
    }
}
