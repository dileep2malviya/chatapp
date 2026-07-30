import { emailServiceSend } from "../services/email.services.js";
import fs from "fs/promises";
import path from "path";
import { EmailOptions } from "../types/email.js";

const otpHandler = async (data: EmailOptions) => {

    const filePath = path.join(
        process.cwd(),
        "src",
        "templates",
        "otp.html"
    );

    let html = await fs.readFile(filePath, "utf-8");

    html = html.replace("{{OTP}}", data.text);

    await emailServiceSend.send({
        to:data.to,
        subject:"OTP Verification",
        text: html
    });

}

export {
    otpHandler
}