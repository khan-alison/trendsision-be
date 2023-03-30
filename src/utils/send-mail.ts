import * as nodemailer from "nodemailer";
import * as pug from "pug";
import { htmlToText } from "html-to-text";

export class PasswordResetEmail {
    constructor(
        private readonly name: string,
        private readonly resetURL: string
    ) {}

    async send(): Promise<void> {
        // Create nodemailer transport
        const transport = nodemailer.createTransport({
            service: "Gmail",
            host: process.env.EMAIL_HOST,
            post: process.env.EMAIL_PORT,
            auth: {
                user: process.env.GMAIL_USERNAME,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        // Render email template
        const html = pug.renderFile(
            `${__dirname}/templates/password-reset.pug`,
            {
                name: this.name,
                resetURL: this.resetURL,
            }
        );

        // Define email options
        const mailOptions = {
            from: `Your Name <${process.env.GMAIL_USERNAME}>`,
            to: this.name,
            subject: "Password reset request",
            html,
            text: htmlToText(html),
        };

        // Send email
        await transport.sendMail(mailOptions);
    }
}
