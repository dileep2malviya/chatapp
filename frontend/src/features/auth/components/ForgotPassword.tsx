import CustomButton from '@/components/ui/button'
import { CustomInput, CustomPasswordInput } from '@/components/ui/input/Input'
import { ForgotPasswordSchemaType, ForgotPasswordSchema } from '@/lib/schema/authSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useForgotPassword } from '../hook/useForgotPassword'
import Link from 'next/link'

const ForgotPasswordForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordSchemaType>({
        resolver: zodResolver(ForgotPasswordSchema),
    });

    const {forgotpassword, isLoading} = useForgotPassword()
    const submitForgotPassword = (values: ForgotPasswordSchemaType) => {
        forgotpassword(values)
    }

    return (
        <div className='max-w-md w-full'>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                <div className='text-center mb-5'>
                    <div className="mx-auto w-18 h-18 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                        <Mail size={40} className='text-white' />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Forgot Password
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Enter the email address associated with your account. If an account exists, we'll send you a one-time verification code to reset your password.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(submitForgotPassword)}>
                    <CustomInput
                        type="email"
                        placeholder="Enter Your Email"
                        register={register('email')}
                        error={errors.email?.message}
                        labelText="Email"
                    />
                    <CustomButton
                        type='submit'
                        isLoading={isLoading}
                        className='bg-blue-500 flex justify-center'
                    >
                        <div className='flex items-center justify-center gap-2'>
                                        <span>Send Reset Code</span>
                                        <ArrowRight className='w-5 h-5' />
                                      </div>
                    </CustomButton>
                </form>
                <div className='flex items-center justify-between text-gray-300 mt-1'>
                    <p>Remember your password? <Link  href="/auth/login" className=' cursor-pointer underline'>Sign In</Link></p>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordForm