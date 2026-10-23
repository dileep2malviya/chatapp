import { RegisterFormValuesType } from "@/lib/schema/authSchema";
import { showToast } from "@/lib/toast"
import { UseFormSetError } from "react-hook-form";

export const getExpireTimeForOtp = (): boolean => {
    const otpResendAllowedAt = Number(sessionStorage.getItem("otpResendAllowedAt"))

    if (otpResendAllowedAt > Date.now()) {
        const retryAfter = Math.ceil(
            (otpResendAllowedAt - Date.now()) / 1000
        );

        showToast.error(
            `Please wait ${retryAfter} second${retryAfter === 1 ? "" : "s"} before requesting another OTP.`
        );

        return true
    }

    return false
}

export const removeSessionStorageItems = (keys: string[]): void => {
  keys.forEach((key) => sessionStorage.removeItem(key));
}

export const applyServerErrors = (
  errors: Record<string, string | string[]>,
  setError: UseFormSetError<RegisterFormValuesType>
) => {
  Object.entries(errors).forEach(([field, message]) => {
    const errorMessage = Array.isArray(message) ? message.join(", ") : message;

    if (errorMessage) {
      setError(field as keyof RegisterFormValuesType, {
        message: errorMessage,
      });
    }
  });
};

export const handleLogOut = (): void => {
  sessionStorage.clear();
  window.location.href = "/login";
};