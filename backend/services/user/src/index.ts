import connectDB from './db/index.js'
import 'dotenv/config'
import { app } from './app.js'
import {
    redisPublish,
    redisSubscribe,
    clusterClient,
    checkRedisHealth
} from './config/redisConnection.js'
import { connectRabbitMQ } from './config/rabbitmq.js'

const PORT: number | string = process.env.PORT || 80

console.log(process.env.APP_ENV )

await checkRedisHealth()
await connectRabbitMQ()


await connectDB()
    .then(() => {
        app.get('/', async (req, res) => {
            console.log("check")
            res.status(200).json({ "message": "server running 123 4" })
        })
        app.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.log("error :: ", error)
    })

