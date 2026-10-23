import { ForgotPasswordSchemaType, OtpVerifySchemaType } from "@/lib/schema/authSchema"
import { useForgotPasswordUserMutation, useOtpVerifyUserMutation } from "../authApi"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/toast"
import { AxiosBaseQueryError } from "@/types/api";

export function useOtpVerification() {
    const [otpVerifyUser, { isLoading }] = useOtpVerifyUserMutation()
    const [forgotPasswordUser] = useForgotPasswordUserMutation()
    const router = useRouter()

    const otpVerify = async (payload: OtpVerifySchemaType) => {
        try {
            const response = await otpVerifyUser(payload).unwrap()

            showToast.success(response.message as string)
            router.push('/auth/reset-password')

        } catch (error) {
            const err = error as AxiosBaseQueryError
            const { statusCode, success } = err.data ?? {}

            const message = (err as { data?: { message?: string } })?.data?.message || 'Please try again.'
            showToast.error(message)
            
            if (statusCode === 429 && !success) {
                router.push('/auth/forgot-password')
            }
        }
    }

    const sentOtpAgainForResetPassword = async (payload: ForgotPasswordSchemaType) => {
        try {
            const response = await forgotPasswordUser(payload).unwrap()

            showToast.success(response.message as string)

            return { success: true }
        } catch (error) {
            const message =
                (error as { data?: { message?: string } })?.data?.message || 'Login failed. Please try again.'

            showToast.error(message)

            return { success: false, error: message }
        }
    }


    return { otpVerify, sentOtpAgainForResetPassword, isLoading }
}
