import { ResetPasswordSchemaType } from "@/lib/schema/authSchema"
import { useResetPasswordUserMutation } from "../authApi"
import { useDispatch } from "react-redux"
import { clearForgotPasswordState } from "../authSlice"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/toast"
import { removeSessionStorageItems } from "@/utils/helpers"
import { AxiosBaseQueryError } from "@/types/api"

export function useResetPassword() {
    const [resetPasswordUser, { isLoading }] = useResetPasswordUserMutation()
    const dispatch = useDispatch()
    const router = useRouter()

    const resetPassword = async (payload: ResetPasswordSchemaType) => {
        try {
            const response = await resetPasswordUser(payload).unwrap()
            dispatch(
                clearForgotPasswordState()
            )

            removeSessionStorageItems(["otpEmail", "otpResendAllowedAt"])

            showToast.success(response.message as string)
            router.push('/auth/login')

        } catch (error) {
            const err = error as AxiosBaseQueryError
            const message = (err as { data?: { message?: string } })?.data?.message || 'Please try again.'

            showToast.error(message)
        }
    }

    return { resetPassword, isLoading }
}
