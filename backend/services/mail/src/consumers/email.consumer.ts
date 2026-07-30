import { Channel } from "amqplib";
import { connectRabbitMQ } from "../config/rabbitmq.js";
import { EMAIL_DLX, EMAIL_QUEUE, EMAIL_DLQ, MAX_RETRIES } from "../constants/queue.js";
import { emailHandlers } from "../handlers/index.js";
import { EmailEvent } from "../types/email.js";
import { shouldRetry } from "../utils/retry.js";

const startEmailConsumer = async (channel: Channel):Promise<void> => {

    await channel.assertExchange(EMAIL_DLX, "direct", {
        durable: true,
    });

    await channel.assertQueue(EMAIL_DLQ, {
        durable: true,
    });

    await channel.bindQueue(
        EMAIL_DLQ,
        EMAIL_DLX,
        EMAIL_QUEUE
    );

    await channel.assertQueue(EMAIL_QUEUE, {
        durable: true,
        arguments: {
            "x-dead-letter-exchange": EMAIL_DLX,
            "x-dead-letter-routing-key": EMAIL_QUEUE,
        },
    });

    channel.consume(EMAIL_QUEUE, async (msg) => {

        if (!msg) return;
        
        const event: EmailEvent = JSON.parse(msg.content.toString());

        const handler = emailHandlers[event.type];
        console.log("payload : ",event)

        if (!handler) {
            channel.ack(msg);
            return;
        }

        try {
            await handler(event.payload);

            channel.ack(msg);

        } catch (error: unknown) {

            const headers = msg.properties.headers ?? {};
            const retries = Number(headers.retries ?? 0);

            const errorCode =
                error instanceof Error && "code" in error
                    ? (error as Error & { code?: string }).code
                    : undefined;

            if (errorCode && shouldRetry(errorCode) && retries < MAX_RETRIES) {

                channel.sendToQueue(
                    EMAIL_QUEUE,
                    msg.content,
                    {
                        persistent: true,
                        headers: {
                            ...headers,
                            retries: retries + 1,
                        },
                    }
                );
                channel.ack(msg);

            } else {
                console.log("Maximum retries reached.");
                channel.nack(msg, false, false);
            }
        }
    });

};
export {
    startEmailConsumer
}