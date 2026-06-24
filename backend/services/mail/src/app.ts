import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { startSendOtpConsumer } from './config/rabbitmq.js'

const app = express()

const corsOption = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
} 

app.use(cors(corsOption))
// app.use(express.json({ limit: "20kb" }))
// app.use(express.urlencoded({ extended: true }))
// app.use(express.static("public"))
app.use(cookieParser())

app.get('/health', async (req, res) => {
    console.log("health")
    res.status(200).json({ "message": "health checked" })
})

startSendOtpConsumer()
export {
    app
}