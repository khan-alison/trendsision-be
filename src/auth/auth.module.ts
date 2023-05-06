import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { UsersModule } from "src/users/users.module";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { LocalStrategy } from "../strategies/local.strategy";
import { AuthService } from "./auth.service";
import { MailService } from "./mail.service";

@Module({
    imports: [UsersModule, PassportModule, TypeOrmModule.forFeature([User])],
    providers: [AuthService, LocalStrategy, JwtStrategy, MailService],
    exports: [AuthService],
})
export class AuthModule {}
