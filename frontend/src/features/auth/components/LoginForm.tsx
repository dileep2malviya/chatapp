import CustomButton from '@/components/ui/button'
import { CustomInput, CustomPasswordInput } from '@/components/ui/input/Input'
import { LoginFormValuesType, loginSchema } from '@/lib/schema/authSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useLogin } from '../hook/useLogin'
import Link from 'next/link'

const LoginForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValuesType>({
        resolver: zodResolver(loginSchema),
    });

    const { login, isLoading } = useLogin()
    const submitLogin = (values: LoginFormValuesType) => login(values)

    return (
        <div className='max-w-md w-full'>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                <div className='text-center mb-5'>
                    <div className="mx-auto w-18 h-18 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                        <Mail size={40} className='text-white' />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Welcome to ChatApp
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Welcome back! Sign in to continue your journey
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(submitLogin)}>
                    <CustomInput
                        type="text"
                        placeholder="Enter Your Email"
                        register={register('email')}
                        error={errors.email?.message}
                        labelText="Email"
                    />
                    <CustomPasswordInput
                        type="password"
                        register={register('password')}
                        error={errors.password?.message}
                        placeholder="Enter Your Password"
                    />
                    <CustomButton
                        type='submit'
                        isLoading={isLoading}
                        className='bg-blue-500 flex justify-center'
                    >Login</CustomButton>
                </form>
                <div className='flex items-center justify-between text-gray-300 mt-1'>
                    <p>Don't have an account? <Link href="/auth/register" className=' underline cursor-pointer'>Register</Link></p>
                    <Link href="/auth/forgot-password" className=' underline cursor-pointer'>Forgot Password</Link>
                </div>
            </div>
        </div>
    )
}

export default LoginForm