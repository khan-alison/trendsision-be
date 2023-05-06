import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import { HttpExceptionFilter } from "./utils/http_exception.filter";

async function bootstrap() {
    dotenv.config();
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        })
    );
    await app.listen(3000);
}

bootstrap();
