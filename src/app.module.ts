import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth/auth.controller";
import { AuthModule } from "./auth/auth.module";
import { ToursModule } from "./tours/tours.module";
import { UsersModule } from "./users/users.module";

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
    ],
    controllers: [AuthController],
    providers: [JwtService],
})
export class AppModule {}
// export class AppModule implements NestModule {
//     configure(consumer: MiddlewareConsumer) {
//         consumer.apply(LoggerMiddleware).forRoutes("*");
//     }
// }
