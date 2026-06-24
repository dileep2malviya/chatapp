import 'dotenv/config'
import { app } from './app.js'

const PORT = process.env.PORT || 5000

 app.get('/health', async (req, res) => {
            console.log("health")
            res.status(200).json({ "message": "health checked" })
        })

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})