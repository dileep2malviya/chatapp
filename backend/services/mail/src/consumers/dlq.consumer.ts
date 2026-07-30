import { Channel } from "amqplib";
import { connectRabbitMQ } from "../config/rabbitmq.js";
import { EMAIL_DLQ } from "../constants/queue.js";
import { emailHandlers } from "../handlers/index.js";
import { EmailEvent } from "../types/email.js";

const DLQConsumer = async (channel: Channel): Promise<void> => {

    await channel.assertQueue(EMAIL_DLQ, { durable: true });

    channel.consume(
        EMAIL_DLQ,
        async (msg: any | null): Promise<void> => {
            console.log(msg)
            if (!msg) return;

            try {
                const event: EmailEvent = JSON.parse(
                    msg.content.toString()
                ) as EmailEvent;

                const handler = emailHandlers[event.type];

                if (!handler) {
                    channel.ack(msg);
                    return;
                }

                const headers = msg.properties.headers ?? {};

                const xDeath = headers["x-death"] as
                    | Array<{
                        reason: string;
                        count: number;
                        queue: string;
                    }>
                    | undefined;

                const reason = xDeath?.[0]?.reason;

                if (reason === 'expired') {
                    channel.ack(msg);
                    return;
                }

                console.log("x-death:", xDeath);

                await handler(event.payload);

                channel.ack(msg);
            } catch (error) {
                console.error("DLQ processing failed:", error);

                // Prevent infinite retries on the DLQ.
                channel.ack(msg);
            }
        }
    );
};

export {
    DLQConsumer
}