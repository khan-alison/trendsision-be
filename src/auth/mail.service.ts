import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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
            requireTLS: true,
            secure: false,
        });
    }

    async send(user: User, forgotLink: string): Promise<void> {
        try {
            const mailOptions: nodemailer.SendMailOptions = {
                from: "Khanh",
                to: user.email,
                subject: "Forgot Password",
                html: `
                    <h3>Hello ${user.firstName + " " + user.lastName}!</h3>
                    <p>Please use this <a href="${forgotLink}">link</a> to reset your password.</p>
                    <p>This link only valid on 5 minutes after you get an email.</p>
                `,
            };
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            throw new HttpException(
                "Error sending email",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
