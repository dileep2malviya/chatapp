import { emailServiceSend } from "../services/email.services.js";
import { EmailOptions } from "../types/email.js";

const otpHandler = async (data:EmailOptions) => {

    await emailServiceSend.send({
        to:data.to,
        subject:"Welcome",
        text:`Welcome ${data.to}`
    });

}

export {
    otpHandler
}