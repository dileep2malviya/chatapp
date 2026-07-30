import { emailServiceSend } from "../services/email.services.js";
import fs from "fs/promises";
import path from "path";
import { EmailOptions } from "../types/email.js";

import {currentDate, currentTime} from "../utils/helpers.js"

const passwordChangedHandler = async (data:EmailOptions) => {

    const filePath = path.join(
            process.cwd(),
            "src",
            "templates",
            "passwordUpdate.html"
        );
    
        let html = await fs.readFile(filePath, "utf-8");
    
        html = html.replace("{{Email}}", data.to);
        html = html.replace("{{Account}}", data.to);
        html = html.replace("{{currentDate}}", currentDate);
        html = html.replace("{{currentTime}}", currentTime);

    await emailServiceSend.send({
        to:data.to,
        subject:"Password Changed",
        text:html
    });

}

export {
    passwordChangedHandler
}