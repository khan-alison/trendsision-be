import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dtos/create_user_dto";
import { UpdateUserDto } from "./dtos/update_user.dto";
import { User } from "./user.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersService: Repository<User>
    ) {
        this.usersService = usersService;
    }

    async getAllUser(): Promise<User[]> {
        const users = await this.usersService.find();
        return users;
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.usersService.findOne({ where: { id } });
        return user;
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { name, email, password, photo, role } = createUserDto;
        const user = User.create({ name, email, role, photo, password });
        await this.usersService.save(user);
        return user;
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.usersService.findOne({ where: { id } });
        Object.assign(user, updateUserDto);
        await this.usersService.save(user);
        return user;
    }

    async removeUser(id: string): Promise<void> {
        const user = await this.usersService.delete(id);

        if (user.affected === 0) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
    }
}
