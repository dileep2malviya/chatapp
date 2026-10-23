import { Clock3 } from "lucide-react"

const LoadingView = () => (
  <div className="flex flex-col items-center gap-4 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
      <Clock3 className="h-8 w-8 animate-pulse text-blue-600" />
    </div>
    <h1 className="text-2xl font-bold text-slate-800">Verify Your Account</h1>
    <p className="text-slate-600">
      We&apos;re verifying your email address. This usually takes just a few seconds.
    </p>
  </div>
)

export default LoadingView
