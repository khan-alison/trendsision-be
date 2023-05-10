import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth/auth.controller";
import { AuthModule } from "./auth/auth.module";
import { ReviewsController } from "./reviews/reviews.controller";
import { ReviewsModule } from "./reviews/reviews.module";
import { ReviewsService } from "./reviews/reviews.service";
import { ToursModule } from "./tours/tours.module";
import { UsersModule } from "./users/users.module";
import { CustomNotFoundExceptionFilter } from "./utils/custom-not-found-exception.filter";
import { JwtExpiredExceptionFilter } from "./utils/jwtExpired.exception";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "mysql",
            host: "localhost",
            port: 3306,
            username: "root",
            password: "./khanh2001",
            database: "trendsision_db",
            entities: ["dist/**/*.entity.{ts,js}"],
            synchronize: true,
        }),
        ToursModule,
        UsersModule,
        AuthModule,
        ReviewsModule,
    ],
    controllers: [AuthController, ReviewsController],
    providers: [
        JwtService,
        ReviewsService,
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
