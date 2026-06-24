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

checkRedisHealth()
connectRabbitMQ()
connectDB()
    .then(() => {
        app.get('/', async (req, res) => {
            console.log("check")
            res.status(200).json({ "message": "server running 123 4" })
        })
        app.get('/health', async (req, res) => {
            console.log("health")
            res.status(200).json({ "message": "health checked" })
        })
        app.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.log("error :: ", error)
    })

