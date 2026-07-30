import connectDB from './db/index.js'
import 'dotenv/config'
import { app } from './app.js'
import { connectRabbitMQ } from './config/rabbitmq.js'
import { connectRedis } from './config/redisConnection.js'

const PORT: number | string = process.env.PORT || 80

await connectRabbitMQ()
await connectDB()
    .then(async () => {
        await connectRedis()
        app.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.log("error :: ", error)
    })

