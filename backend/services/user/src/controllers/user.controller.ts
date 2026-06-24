import { publishMessageToQueue } from '../config/rabbitmq.js'
import { clusterClient, getRedisFunction, setRedisFunction } from '../config/redisConnection.js'
import { ApiError } from '../utils/errorApi.js'
import { apiResponse } from '../utils/responseApi.js'
import {TryCatch} from '../utils/tryCatch.js'

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

const getOtpKey = (email:string) => {
    return `opt:${email}`
}
const getOtpRateLimitKey = (email:string) => {
    return `otp:ratelimit:${email}`
}

const loginUser = TryCatch(async(req, res) => {
    const {email} = req.body

    const rateLimit = await getRedisFunction(getOtpRateLimitKey(email)) 
    if(rateLimit){
        throw new ApiError(429,'Too many requests. Please try again after 60 seconds.')
    }
    const optCode = generateOtp()
    await setRedisFunction(getOtpKey(email),optCode,120)
    await setRedisFunction(getOtpRateLimitKey(email),"true",60)

    const message = {
        to: email,
        subject: "Your Verification Code",
        body: `Your OTP is ${optCode}. It is valid for 5 minutes`
    }

    await publishMessageToQueue('send-otp',message)

    res.status(200).json(apiResponse(200,'true','OTP sent your mail'))
})

export {
    loginUser
}