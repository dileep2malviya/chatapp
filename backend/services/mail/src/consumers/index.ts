import { connectRabbitMQ } from '../config/rabbitmq.js';
import { DLQConsumer } from './dlq.consumer.js'
import { startEmailConsumer } from './email.consumer.js'

const connectionfunction = async () => {
    const channel = await connectRabbitMQ();
    await startEmailConsumer(channel)
    await DLQConsumer(channel)
}
export default connectionfunction



