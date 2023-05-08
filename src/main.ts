import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import { HttpExceptionFilter } from "./utils/http_exception.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

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

    const config = new DocumentBuilder()
        .setTitle("Trensision")
        .setDescription("Trendsision API description")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
        swaggerOptions: {
            tagsSorter: "alpha",
            operationsSorter: "alpha",
        },
    });

    SwaggerModule.setup("api", app, document);

    await app.listen(3333);
}

bootstrap();
