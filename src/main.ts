import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import helmet from "helmet";
import { HttpExceptionFilter } from "./utils/http_exception.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as Fingerprint2 from "fingerprintjs2";

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
    app.use(helmet());

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
