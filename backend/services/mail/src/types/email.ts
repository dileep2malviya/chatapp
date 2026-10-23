type EmailType = "OTP" | "PASSWORD_CHANGED"  | "WELCOME_USER" | "USER_VERIFICATION";

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