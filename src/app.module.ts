import { Module } from "@nestjs/common";
import { ToursModule } from "./tours/tours.module";
import { TypeOrmModule } from "@nestjs/typeorm";

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
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
