"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { accountVerifySelector } from "../authSelectors"
import { useAccountVerify } from "../hook/useAccountVerify"
import LoadingView from "@/components/ui/auth/LoadingView"
import SuccessView from "@/components/ui/auth/SuccessView"
import ErrorView from "@/components/ui/auth/ErrorView"
import { useRouter } from "next/navigation"
import { VerificationResult, VerificationState } from "../authTypes"

const getVerificationState = (
  result: VerificationResult | null,
  isLoading: boolean,
): VerificationState => {
  if (isLoading || !result) {
    return { status: "loading" }
  }

  if (result.error) {
    return {
      status: "error",
      message: result.data || "Verification failed. Please try again.",
    }
  }

  return {
    status: "success",
    message: result.data || "Your account has been verified successfully.",
  }
}

const AccountVerify = () => {
  const router = useRouter()
  const accountVerifyData = (useSelector(accountVerifySelector) ?? null) as VerificationResult | null
  const hasCalled = useRef(false)

  const searchParams = useSearchParams()

  const email: string | null = searchParams.get('email')
  const token: string | null = searchParams.get('token')

  console.log(email)
  console.log(token)

  const { accountVerify, againAccountVerify, isVerifying, isResending } = useAccountVerify()

  useEffect(() => {
    if (!email || !token) {
      router.push('/auth/login')
      return
    }

    if (hasCalled.current) {
      return
    }

    hasCalled.current = true
    accountVerify({ email, token })

  }, [email, token, accountVerify, router])
 
  const resendVerificationEmail = () => {
    if (email) {
      againAccountVerify({ email })
    }
  }

  const verificationState = getVerificationState(
    accountVerifyData,
    isVerifying,
  )

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
      {verificationState.status === "loading" && <LoadingView />}
      {verificationState.status === "success" && (
        <SuccessView message={verificationState.message} />
      )}
      {verificationState.status === "error" && (
        <ErrorView
          message={verificationState.message}
          onResend={resendVerificationEmail}
          isLoading={isResending}
        />
      )}
    </div>
  )
}

export default AccountVerify