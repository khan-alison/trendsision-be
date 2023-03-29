import { Injectable, NotFoundException, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
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

    async getAllUser(): Promise<User[]> {
        const users = await this.usersService.find();
        return users;
    }

    @UseGuards(JwtAuthGuard)
    async getUserById(id: string): Promise<User> {
        const user = await this.usersService.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        } else {
            return user;
        }
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
