import { ApiError } from "./errorApi.js";

export const validateOtpResendTime = (otpResendAllowedAt: number): void => {
    if (otpResendAllowedAt > Date.now()) {
        const retryAfter = Math.ceil(
            (otpResendAllowedAt - Date.now()) / 1000
        );

        throw new ApiError(
            429,
            `Please wait ${retryAfter} second${retryAfter === 1 ? "" : "s"} before requesting another OTP.`,
            {
                retryAfter: retryAfter.toString(),
                resendAllowedAt: otpResendAllowedAt.toString(),
            }
        );
    }
};