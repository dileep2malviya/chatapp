"use client"
import CustomButton from '@/components/ui/button'
import { OtpInput, } from '@/components/ui/input/Input'
import { otpVerifySchema, OtpVerifySchemaType } from '@/lib/schema/authSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useOtpVerification } from '../hook/useOtpVerification'
import { forgotPasswordEmailSelector } from '../authSelectors'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/lib/toast'
import { useForgotPassword } from '../hook/useForgotPassword'

const OtpVerificationForm = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string | undefined | null>()
  const forgotPasswordEmail = useSelector(forgotPasswordEmailSelector)
  const { otpVerify, isLoading } = useOtpVerification()

  const { forgotpassword, timeLeft } = useForgotPassword()

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const formattedTime = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`

  useEffect(() => {
    const sessionEmail = sessionStorage.getItem("otpEmail") ?? null;

    setEmail(forgotPasswordEmail || sessionEmail)
  }, [forgotPasswordEmail])


  useEffect(() => {
    if (email === undefined) return;

    if (!email) {
      showToast.error("Please start the password reset process again.")
      router.replace("/auth/forgot-password")
    }
    setValue("email", email || "")
  }, [email, router]);


  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OtpVerifySchemaType>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      email: forgotPasswordEmail ?? "",
      otp: "",
    },
  })

  const otp = watch("otp", "")

  const sendOtpAgainHandler = async () => {
    if (!email) return

    await forgotpassword({ email: email })
  }

  return (
    <div className='max-w-md w-full'>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <div className='text-center mb-5'>
          <div className="mx-auto w-18 h-18 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
            <Mail size={40} className='text-white' />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Enter Verification Code
          </h1>
          <p className="text-gray-300 text-lg">
            We've sent a 6-digit verification code to
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(otpVerify)}>
          {email && <div className={`w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none text-center`}>
            {email}
          </div>}
          <OtpInput
            value={otp}
            setValue={setValue}
            error={errors.otp?.message}
          />
          <CustomButton
            type='submit'
            className='flex items-center justify-center w-full bg-blue-500 text-white py-4 px-6 rounded-lg cursor-pointer'
            isLoading={isLoading}
          >
            <div className='flex items-center justify-center gap-2'>
              <span>Send Verification</span>
              <ArrowRight className='w-5 h-5' />
            </div>
          </CustomButton>
        </form>
        <div className='flex items-center justify-between text-gray-300 mt-1'>
          <p>Didn't receive the code?</p>
          <p> <span aria-disabled={timeLeft > 0 ? true : false} onClick={timeLeft === 0 ? sendOtpAgainHandler : undefined}
            className={`underline ${timeLeft === 0
              ? "cursor-pointer text-white hover:text-blue-400"
              : "cursor-not-allowed text-gray-500"
              }`}> Resend OTP</span> {timeLeft > 0 && <span> {formattedTime}</span>}</p>
        </div>
      </div>
    </div>
  )
}

export default OtpVerificationForm