import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/user.route.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}

app.use(cors(corsOptions))


app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

app.get('/health', async (req, res) => {
    console.log("health")
    res.status(200).json({ "message": "health checked" })
})

app.use('/api/v1/user', userRoutes)
app.use(errorHandler)
export {
    app
}