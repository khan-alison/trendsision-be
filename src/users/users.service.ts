import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { UpdateUserDto } from "./dtos/update_user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>
    ) {
        this.usersRepository = usersRepository;
    }

    async getAllUser(filter?: any): Promise<UserEntity[]> {
        const queryBuilder = this.usersRepository.createQueryBuilder("user");
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

    async getCurrentUser(email: string): Promise<UserEntity> {
        const user = this.getUserByEmail(email);
        return user;
    }

    async getUserById(id: string): Promise<UserEntity> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new HttpException(
                `User with id ${id} not found`,
                HttpStatus.NOT_FOUND
            );
        }
        return user;
    }

    async getUserByEmail(email: string): Promise<UserEntity> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new HttpException(
                `User with id ${email} not found`,
                HttpStatus.NOT_FOUND
            );
        }
        return user;
    }

    async updateUser(
        id: string,
        updateUserDto: UpdateUserDto
    ): Promise<UserEntity> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new HttpException(
                `User with id ${id} not found`,
                HttpStatus.NOT_FOUND
            );
        }
        Object.assign(user, updateUserDto);
        await this.usersRepository.save(user);
        return user;
    }

    async removeUser(email: string, id: string): Promise<void> {
        const sendRequestUser = await this.usersRepository.findOne({
            where: { email },
        });
        const wantDeleteUser = await this.usersRepository.findOne({
            where: { id },
        });

        if (!wantDeleteUser) {
            throw new HttpException(
                `User with id ${id} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        if (wantDeleteUser?.id === sendRequestUser.id) {
            throw new HttpException(
                "You can't delete your account",
                HttpStatus.BAD_REQUEST
            );
        }

        const deletedUser = await this.usersRepository.delete(id);
        if (deletedUser.affected === 0) {
            throw new HttpException(
                `User with id ${id} not found`,
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
