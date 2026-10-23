import { emailServiceSend } from "../services/email.services.js";
import fs from "fs/promises";
import path from "path";
import { EmailOptions } from "../types/email.js";

const WelcomeHandler = async (data: EmailOptions) => {

    const filePath = path.join(
        process.cwd(),
        "src",
        "templates",
        "welcome.html"
    );

    let html = await fs.readFile(filePath, "utf-8");

    html = html.replace("{{name}}", data.to);
    html = html.replace("{{email}}", data.to);
    html = html.replace("{{url}}", data.text);

    const result = await emailServiceSend.send({
        to: data.to,
        subject: "Welcome",
        text: html,
    });

    console.log("Welcome email sent:", result);

}

export {
    WelcomeHandler
}