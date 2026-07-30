import mongoose from 'mongoose'
import {DB_NAME} from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}` as string)
        console.log(`Mongodb connect !! DB HOST : ${connectionInstance.connection.host}`)
    } catch (error: unknown) {
        console.log("ERROR",process.env.MONGO_URL)
        console.log("ERROR",error)
        process.exit(1)
    }
}

export default connectDB