import { ForgotPasswordSchemaType } from "@/lib/schema/authSchema"
import { useForgotPasswordUserMutation } from "../authApi"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/toast"
import { useDispatch } from "react-redux"
import { clearForgotPasswordState, setForgotPasswordEmail } from "../authSlice"
import { getExpireTimeForOtp, removeSessionStorageItems } from "@/utils/helpers"
import { AxiosBaseQueryError } from "@/types/api"
import { useCountDown } from "./useCountDown"
import { useEffect, useState } from "react"

export function useForgotPassword() {
    const [countdownTarget, setCountdownTarget] = useState<number | null>(null)
    const [forgotPasswordUser, { isLoading }] = useForgotPasswordUserMutation()
    const router = useRouter()
    const dispatch = useDispatch()
    const timeLeft = useCountDown(countdownTarget)

    useEffect(() => {
        const storedTarget = sessionStorage.getItem("otpResendAllowedAt")
        setCountdownTarget(storedTarget ? Number(storedTarget) : null)
    }, [])

    const forgotpassword = async (payload: ForgotPasswordSchemaType) => {

        if (getExpireTimeForOtp()) return
        const otpResendAllowedAt = sessionStorage.getItem("otpResendAllowedAt") ?? undefined

        const payloadObj: ForgotPasswordSchemaType & {
            otpResendAllowedAt?: string;
        } = {
            ...payload,
            otpResendAllowedAt: otpResendAllowedAt
        }

        try {
            const response = await forgotPasswordUser(payloadObj).unwrap()
            const { data, success } = response

            if (data && success) {
                sessionStorage.setItem("otpEmail", data.email);
                sessionStorage.setItem(
                    "otpResendAllowedAt",
                    data.resendAllowedAt.toString()
                );

                dispatch(
                    setForgotPasswordEmail(payload)
                )
                setCountdownTarget(Number(data.resendAllowedAt))
                showToast.success(response.message as string)
                router.push("/auth/reset-otp-verify")
            } else {
                dispatch(
                    clearForgotPasswordState()
                )

                removeSessionStorageItems(["otpEmail", "otpResendAllowedAt"])
                showToast.success(response.message as string)
            }

        } catch (error) {
            const err = error as AxiosBaseQueryError
            const message = (err as { data?: { message?: string } })?.data?.message || 'Please try again.'

            showToast.error(message)
        }
    }

    return { forgotpassword, timeLeft, isLoading }
}
