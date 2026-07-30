import { Transporter } from 'nodemailer'
import Bottleneck from "bottleneck";
import { EmailOptions } from '../types/email.js';
import { transporter as defaultTransporter } from '../config/mailer.js';

const limiter = new Bottleneck({
    maxConcurrent: 5,
    minTime: 5,
})

export class EmailService {
    constructor(private readonly transporter: Pick<Transporter, 'sendMail'> = defaultTransporter) {}

    async send(options: EmailOptions) {
        return limiter.schedule(async () => {
            return this.transporter.sendMail({
                from: 'Chat app <no-reply@example.com>',
                to: options.to,
                subject: options.subject,
                html: options.text,
            });
        });
    }
}

const emailServiceSend = new EmailService();

export {
    emailServiceSend
}