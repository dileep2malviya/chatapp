import { publishMessageToQueue } from "../config/rabbitmq.js";
import { setRedisFunction } from "../config/redisConnection.js";
import { EMAIL_QUEUE } from "../constants/queue.js";

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export const sendOtp = async ({
    email,
    redisKey,
    emailType,
    subject,
}: {
    email: string;
    redisKey: string;
    emailType: "OTP" | "RESET_PASSWORD";
    subject: string;
}) => {
    const otp = generateOtp();

    await setRedisFunction(redisKey, otp, 120);

    await publishMessageToQueue(EMAIL_QUEUE, {
        type: emailType,
        payload: {
            to: email,
            subject,
            text: otp,
        },
    });
};

export const sendEmail = async ({
    email,
    text,
    emailType,
    subject,
}: {
    email: string;
    text: string;
    emailType: "WELCOME_USER" | "USER_VERIFICATION";
    subject: string;
}) => {

    await publishMessageToQueue(EMAIL_QUEUE, {
        type: emailType,
        payload: {
            to: email,
            subject,
            text: text,
        },
    });
};