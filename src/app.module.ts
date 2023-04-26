import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth/auth.controller";
import { AuthModule } from "./auth/auth.module";
import { ReviewsController } from "./reviews/reviews.controller";
import { ReviewsModule } from "./reviews/reviews.module";
import { ReviewsService } from "./reviews/reviews.service";
import { ToursModule } from "./tours/tours.module";
import { UsersModule } from "./users/users.module";
import { APP_FILTER } from "@nestjs/core";
import { CustomNotFoundExceptionFilter } from "./utils/custom-not-found-exception.filter";

@Module({
    imports: [
        ToursModule,
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
    ],
})
export class AppModule {}
// export class AppModule implements NestModule {
//     configure(consumer: MiddlewareConsumer) {
//         consumer.apply(LoggerMiddleware).forRoutes("*");
//     }
// }
