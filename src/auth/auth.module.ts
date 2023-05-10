import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/entities/user.entity";
import { UsersModule } from "src/users/users.module";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { LocalStrategy } from "../strategies/local.strategy";
import { AuthService } from "./auth.service";
import { MailService } from "./mail.service";
import { DeviceSessionEntity } from "src/entities/device-session.entity";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
    imports: [
        UsersModule,
        PassportModule,
        CacheModule.register(),
        TypeOrmModule.forFeature([UserEntity, DeviceSessionEntity]),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, MailService],
    exports: [AuthService],
})
export class AuthModule {}
