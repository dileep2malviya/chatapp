import { emailServiceSend } from "../services/email.services.js";
import fs from "fs/promises";
import path from "path";
import { EmailOptions } from "../types/email.js";

const resetPasswordHandler = async (data:EmailOptions) => {

    const filePath = path.join(
            process.cwd(),
            "src",
            "templates",
            "resetPasswordOtp.html"
        );
    
        let html = await fs.readFile(filePath, "utf-8");
    
        html = html.replace("{{OTP}}", data.text);
        html = html.replace("{{Email}}", data.to);

    await emailServiceSend.send({
        to:data.to,
        subject:"Password Changed",
        text:html
    });

}

export {
    resetPasswordHandler
}