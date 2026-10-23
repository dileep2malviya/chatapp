import { LoginFormValuesType, RegisterFormValuesType } from "@/lib/schema/authSchema"
import { useLoginUserMutation, useRegisterUserMutation } from "../authApi"
import { useDispatch } from "react-redux"
import { setCredentials } from "../authSlice"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/toast"
import { AxiosBaseQueryError } from "@/types/api"
import { UseFormSetError } from "react-hook-form"
import { applyServerErrors } from "@/utils/helpers"

export function useRegister(setError: UseFormSetError<RegisterFormValuesType>) {
    const [registerUser, { isLoading }] = useRegisterUserMutation()
    const dispatch = useDispatch()
    const router = useRouter()

    const userRegister = async (payload: RegisterFormValuesType | FormData) => {
        try {
            const response = await registerUser(payload).unwrap()

            showToast.success(response.message as string)
            router.push('/auth/login')

        } catch (error) {
            const err = error as AxiosBaseQueryError
            const data = err.data

            if (data?.errors && Object.keys(data.errors).length > 0) {
                applyServerErrors(data.errors, setError)
            }

            const message = data?.message || 'Please try again.'
            showToast.error(message)
        }
    }

    return { userRegister, isLoading }
}
