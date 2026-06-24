import amqp, { type Channel, type ChannelModel } from 'amqplib'

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

        await channel.assertQueue(queueName, { durable: true })
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true })
    } catch (error) {
        console.log('Failed to connect channel :: ', error)
        channel = null
        throw error
    }
}

export {
    connectRabbitMQ,
    publishMessageToQueue
}