import 'dotenv/config'
import { app } from './app.js'
import { startSendOtpConsumer } from './config/rabbitmq.js'

const PORT = process.env.PORT || 5000

startSendOtpConsumer()

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})