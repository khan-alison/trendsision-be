import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import * as csurf from "csurf";

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    private csrfProtection;

    constructor() {
        this.csrfProtection = csurf({
            cookie: true,
        });
    }

    use(req: Request, res: Response, next: any) {
        this.csrfProtection(req, res, next);
    }
}
