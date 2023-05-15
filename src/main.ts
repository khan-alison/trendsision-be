import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import * as Fingerprint2 from "fingerprintjs2";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./utils/http_exception.filter";

async function bootstrap() {
    dotenv.config();
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        })
    );

    const getDeviceId = () => {
        return new Promise((resolve) => {
            Fingerprint2.get((components: any) => {
                const values = components.map(
                    (component: any) => component.value
                );
                const murmur = Fingerprint2.x64hash128(values.join(""), 31);
                resolve(murmur);
            });
        });
    };

    app.use(async (req, res, next) => {
        const deviceId = await getDeviceId();
        req.deviceId = deviceId;
        next();
    });

    app.use(helmet());
    app.enableCors();

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
