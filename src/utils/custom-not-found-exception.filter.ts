import { Catch, ExceptionFilter, NotFoundException } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(NotFoundException)
export class CustomNotFoundExceptionFilter implements ExceptionFilter {
    catch(
        exception: NotFoundException,
        host: import("@nestjs/common").ArgumentsHost
    ) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        response.status(status).json({
            statusCode: status,
            message: exception.message,
            error: "Not Found",
            path: request.url,
        });
    }
}
