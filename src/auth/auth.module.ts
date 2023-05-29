import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { UsersModule } from "src/users/users.module";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { LocalStrategy } from "../strategies/local.strategy";
import { AuthService } from "./auth.service";
import { MailService } from "./mail.service";
import { DeviceSession } from "src/entities/device-session.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";

@Module({
    imports: [
        UsersModule,
        PassportModule,
        CacheModule.register(),
        TypeOrmModule.forFeature([User, DeviceSession]),
    ],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        MailService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
    exports: [AuthService],
})
export class AuthModule {}
