import 'dotenv/config'
import { app } from './app.js'
import RabbitMQConsumer  from './consumers/index.js'


const PORT = process.env.PORT || 5000

RabbitMQConsumer()

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})