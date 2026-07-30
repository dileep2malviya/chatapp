import amqp, { type Channel, type ChannelModel, type Options } from 'amqplib'
import { ApiError } from '../utils/errorApi.js'
import { EMAIL_DLX } from '../constants/queue.js'

let channel: Channel | null = null
let connection: ChannelModel | null = null

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
            connection = await amqp.connect(options)
            channel = await connection.createChannel()

            connection.on('error', (err: Error) => {
                console.error('RabbitMQ connection error:', err)
                channel = null
            })

            connection.on('close', () => {
                console.warn('RabbitMQ connection closed')
                channel = null
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

const publishMessageToQueue = async (queueName: string, message: any): Promise<void> => {
    try {
        if (!channel) {
            channel = await connectRabbitMQ()
        }

        const queueOptions: Options.AssertQueue = {
            durable: true,
            arguments: {
                    "x-dead-letter-exchange": EMAIL_DLX,
                    "x-dead-letter-routing-key": queueName,
                },
        }

        await channel.assertQueue(queueName, queueOptions)
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true,expiration: "120000" })
    } catch (error: unknown) {
        console.error('Failed to publish message to RabbitMQ queue', queueName, error)
        channel = null

        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code: number }).code === 406
        ) {
            throw new ApiError(
                502,
                'Failed to publish message: queue configuration mismatch. Please verify queue settings and dead-letter exchange.',
                { queue: 'Queue already exists with different arguments' }
            )
        }

        throw new ApiError(
            502,
            'Failed to publish message to RabbitMQ.',
            { queue: 'Unable to enqueue message' }
        )
    }
}

export {
    connectRabbitMQ,
    publishMessageToQueue
}