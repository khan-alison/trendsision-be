import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { UserController } from "./users.controller";
import { UsersService } from "./users.service";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";

@Module({
    controllers: [UserController],
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [
        UsersService,
        JwtService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
    exports: [UsersService],
})
export class UsersModule {}
