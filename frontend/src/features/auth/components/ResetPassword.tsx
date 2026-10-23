import CustomButton from '@/components/ui/button'
import { CustomPasswordInput } from '@/components/ui/input/Input'
import { ResetPasswordSchema, ResetPasswordSchemaType } from '@/lib/schema/authSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useResetPassword } from '../hook/useResetPassword'
import Link from 'next/link'

const ResetPasswordForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordSchemaType>({
        resolver: zodResolver(ResetPasswordSchema),
    });

    const { resetPassword, isLoading } = useResetPassword()

    return (
        <div className='max-w-md w-full'>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                <div className='text-center mb-5'>
                    <div className="mx-auto w-18 h-18 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                        <Mail size={40} className='text-white' />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Reset Your Password
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Create a new password for your account. Your new password must be different from your previous password.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(resetPassword)}>
                    {/* <CustomInput
                        type="email"
                        placeholder="Enter Your Email"
                        register={register('email')}
                        error={errors.email?.message}
                        labelText="Email"
                    /> */}
                    <CustomPasswordInput
                        type="password"
                        textLabel="New Password"
                        register={register('newPassword')}
                        error={errors.newPassword?.message}
                        placeholder="Enter Your New Password"
                    />
                    <CustomPasswordInput
                        type="password"
                        textLabel="Confirm Password"
                        register={register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                        placeholder="Re-enter your new password"
                    />
                    <CustomButton
                        type='submit'
                        isLoading={isLoading}
                        className='bg-blue-500 flex justify-center'
                    >Reset Password</CustomButton>
                </form>
                <div className='flex items-center justify-between text-gray-300 mt-1'>
                    <p>Remember your password? <Link  href="/auth/login" className=' cursor-pointer underline'>Sign In</Link></p>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordForm