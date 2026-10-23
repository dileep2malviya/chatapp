import { LoginFormValuesType } from "@/lib/schema/authSchema"
import { useLoginUserMutation } from "../authApi"
import { useDispatch } from "react-redux"
import { setCredentials } from "../authSlice"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/toast"
import { AxiosBaseQueryError } from "@/types/api"

export function useLogin() {
    const [loginUser, { isLoading }] = useLoginUserMutation()
    const dispatch = useDispatch()
    const router = useRouter()

    const login = async (payload: LoginFormValuesType) => {
        try {
            const response = await loginUser(payload).unwrap()
            const { user, accessToken } = response.data;

            dispatch(
                setCredentials({
                    user,
                    accessToken: accessToken,
                })
            );

            showToast.success(response.message as string)
            router.push('/chat')

        } catch (error) {
            const err = error as AxiosBaseQueryError
            const message = (err as { data?: { message?: string } })?.data?.message || 'Login failed. Please try again.'

            showToast.error(message)
        }
    }

    return { login, isLoading }
}
