import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { UserController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
    controllers: [UserController],
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [UsersService, JwtService],
    exports: [UsersService],
})
export class UsersModule {}
