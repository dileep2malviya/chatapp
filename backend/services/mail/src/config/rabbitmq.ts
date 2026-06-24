import amqp, { type Channel } from 'amqplib'
import nodemailer from 'nodemailer'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const getRabbitMQConfig = () => ({
    protocol: 'amqp',
    hostname: process.env.RABBITMQ_HOST_NAME || 'rabbitmq',
    port: process.env.RABBITMQ_PORT ? parseInt(process.env.RABBITMQ_PORT, 10) : 5672,
    username: process.env.RABBITMQ_DEFAULT_USER || 'guest',
    password: process.env.RABBITMQ_DEFAULT_PASS || 'guest',
    heartbeat: 30
})

const connectRabbitMQ = async (): Promise<Channel> => {
    const options = getRabbitMQConfig()
    const maxAttempts = 10

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const connection = await amqp.connect(options)
            const channel = await connection.createChannel()

            connection.on('error', (err: Error) => {
                console.error('RabbitMQ connection error:', err)
            })

            connection.on('close', () => {
                console.warn('RabbitMQ connection closed')
            })

            console.log('Connected to RabbitMQ at', options.hostname)
            return channel
        } catch (err) {
            console.log(`RabbitMQ connect attempt ${attempt} failed:`, err)
            if (attempt === maxAttempts) throw err
            await wait(2000 * attempt)
        }
    }

    throw new Error('Failed to connect to RabbitMQ')
}

const startSendOtpConsumer = async (): Promise<void> => {
    try {
        const channel = await connectRabbitMQ()
        const queueName = 'send-otp'

        await channel.assertQueue(queueName, { durable: true })
        console.log('Connected successfully in email service')

        channel.consume(queueName, async (msg) => {
            console.log("msg :: ",msg)
            if (msg) {
                try {
                    const { to, subject, body } = JSON.parse(msg.content.toString())
                    const transporter = nodemailer.createTransport({
                        host: process.env.EMAIL_HOST_NAME || 'smtp.gmail.com',
                        port: process.env.EMAIL_PORT_NAME ? parseInt(process.env.EMAIL_PORT_NAME, 10) : 465,
                        secure: true,
                        auth: {
                            user: process.env.EMAIL_HOST_USERNAME || '',
                            pass: process.env.EMAIL_HOST_PASSWORD || ''
                        }
                    })

                    await transporter.sendMail({
                        from: 'Chat app <no-reply@example.com>',
                        to,
                        subject,
                        text: body
                    })

                    channel.ack(msg)
                } catch (error) {
                    console.log('Email send error :: ', error)
                    channel.nack(msg, false, false)
                }
            }
        })
    } catch (error) {
        console.log('Failed to start OTP consumer :: ', error)
        throw error
    }
}

export {
    startSendOtpConsumer
}