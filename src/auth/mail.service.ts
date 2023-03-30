import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { User } from "src/entities/user.entity";

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.USER_HOST,
            port: process.env.USER_PORT,
            auth: {
                user: process.env.USER_NAME,
                pass: process.env.USER_PASSWORD,
            },
        });
    }

    async send(user: User, forgotLink: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: "Khanh",
                to: user.email,
                subject: "Forgot Password",
                html: `
                    <h3>Hello ${user.name}!</h3>
                    <p>Please use this <a href="${forgotLink}">link</a> to reset your password.</p>
                    <p>This link only valid on 5 minutes after you get an email.</p>
                `,
            });
        } catch (error) {
            throw new Error("Error sending email");
        }
    }
}
