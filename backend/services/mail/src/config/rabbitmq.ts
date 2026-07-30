import amqp, { type Channel } from 'amqplib'

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



export {
    connectRabbitMQ
}