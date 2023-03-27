import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { UsersModule } from "src/users/users.module";
import { jwtConstants } from "src/utils/constants";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./local.strategy";

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: "60s" },
        }),
        TypeOrmModule.forFeature([User]),
    ],
    providers: [AuthService, LocalStrategy],
    exports: [AuthService],
})
export class AuthModule {}
