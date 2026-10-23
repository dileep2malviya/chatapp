import { AccountVerifySchemaType, AgainAccountVerifySchemaType, LoginFormValuesType } from "@/lib/schema/authSchema"
import { useAccountVerifyUserMutation, useAgainAccountVerifyUserMutation } from "../authApi"
import { useDispatch } from "react-redux"
import { setAccountVerify, setCredentials } from "../authSlice"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/toast"
import { AxiosBaseQueryError } from "@/types/api"

export function useAccountVerify() {
    const [accountVerifyUser, { isLoading: isVerifying }] = useAccountVerifyUserMutation()
    const [againAccountVerifyUser, { isLoading: isResending }] = useAgainAccountVerifyUserMutation()
    const dispatch = useDispatch()
    const router = useRouter()

    const accountVerify = async (payload: AccountVerifySchemaType) => {
        try {
            const response = await accountVerifyUser(payload).unwrap()

            console.log("Account verification response:", response)

            if (response && response.data) {
                dispatch(
                    setAccountVerify({
                        error: false,
                        data: response.message,
                    })
                )
            }

            showToast.success(response.message as string)
            router.replace('/auth/account-verify')

        } catch (error) {
            const err = error as AxiosBaseQueryError
            const data = err.data
            console.error("Account verification error:", err)
            dispatch(
                setAccountVerify({
                    error: true,
                    data: err.data?.message || 'Verification failed. Please try again.',
                })
            )
            if (data?.errors && data.errors.message === "jwt expired") {
                showToast.error("Verification token has expired. Please request a new verification email.")
            } else {
                const message = (err as { data?: { message?: string } })?.data?.message || 'Verification failed. Please try again.'
                showToast.error(message)
            }
        }
    }
    const againAccountVerify = async (payload: AgainAccountVerifySchemaType) => {
        try {
            const response = await againAccountVerifyUser(payload).unwrap()

            // if (response && response.data) {
            //     dispatch(
            //         setAccountVerify({
            //             error: false,
            //             data: response.message,
            //         })
            //     )
            // }

            showToast.success(response.message as string)
            // router.push('/login')

        } catch (error) {
            const err = error as AxiosBaseQueryError
            const message = (err as { data?: { message?: string } })?.data?.message || 'Verification failed. Please try again.'
            showToast.error(message)
        }
    }

    return { accountVerify, againAccountVerify, isVerifying, isResending }
}
