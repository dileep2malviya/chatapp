import CustomButton from "../button"
import { X } from "lucide-react"

const ErrorView = ({ message, onResend, isLoading }: {
  message: string
  onResend: () => void
  isLoading: boolean
}) => (
  <div className="flex flex-col items-center gap-4 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
      <X className="h-8 w-8 text-red-600" />
    </div>
    <h1 className="text-2xl font-bold text-slate-800">{message}</h1>
    <CustomButton
      isLoading={isLoading}
      onclick={onResend}
      className="flex justify-center bg-blue-500"
      size="sm"
    >
      Send Email
    </CustomButton>
  </div>
)

export default ErrorView