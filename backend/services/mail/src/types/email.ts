type EmailType = "OTP" | "PASSWORD_CHANGED";

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string | HTMLElement;
}

interface EmailEvent {
    type: EmailType;
    payload: EmailOptions;
}
export type {
    EmailOptions,
    EmailEvent
}