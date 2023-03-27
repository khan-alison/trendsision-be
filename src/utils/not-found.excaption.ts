import { Catch, ArgumentsHost, NotFoundException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Request, Response } from "express";

@Catch(NotFoundException)
export class NotFoundExceptionFilter extends BaseExceptionFilter {
    catch(exception: NotFoundException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        response.status(404).json({
            statusCode: 404,
            message: "Not Found",
            path: request.url,
        });
    }
}
