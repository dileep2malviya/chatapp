import { otpHandler } from "./otpHandler.js";
import { passwordChangedHandler } from "./passwordChanged.handler.js";
import { resetPasswordHandler } from "./resetPassword.handler.js";

export type EmailType = "OTP" | "PASSWORD_CHANGED" | "RESET_PASSWORD";

export const emailHandlers: Record<EmailType, typeof otpHandler> = {
    OTP: otpHandler,
    PASSWORD_CHANGED: passwordChangedHandler,
    RESET_PASSWORD: resetPasswordHandler
};