import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth/auth.controller";
import { AuthModule } from "./auth/auth.module";
import { ToursModule } from "./tours/tours.module";
import { UsersModule } from "./users/users.module";
import { CustomNotFoundExceptionFilter } from "./utils/custom-not-found-exception.filter";
import { JwtExpiredExceptionFilter } from "./utils/jwtExpired.exception";
import { ReviewsModule } from "./reviews/reviews.module";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "mysql",
            host: "localhost",
            port: 3306,
            username: "root",
            password: "./khanh2001",
            // database: "test_trendsision",
            database: "trendsision_db",
            entities: ["dist/**/*.entity.{ts,js}"],
            synchronize: true,
        }),
        ToursModule,
        UsersModule,
        AuthModule,
        ReviewsModule,
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 10,
        }),
    ],
    controllers: [AuthController],
    providers: [
        JwtService,
        {
            provide: APP_FILTER,
            useClass: CustomNotFoundExceptionFilter,
        },
        {
            provide: APP_FILTER,
            useClass: JwtExpiredExceptionFilter,
        },
    ],
})
export class AppModule {}
