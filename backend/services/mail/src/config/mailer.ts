import nodemailer, { Transporter } from "nodemailer";

const connectNodemailer = (): Transporter => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST_NAME || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT_NAME ? parseInt(process.env.EMAIL_PORT_NAME, 10) : 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_HOST_USERNAME || '',
            pass: process.env.EMAIL_HOST_PASSWORD || ''
        }
    })
}

const transporter = connectNodemailer()

export {
    transporter
}