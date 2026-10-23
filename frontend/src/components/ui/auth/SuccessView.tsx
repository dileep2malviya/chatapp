import { Check } from "lucide-react"
import Link from "next/link"

const SuccessView = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center text-center">
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
      <Check className="h-10 w-10 text-green-600" />
    </div>
    <h2 className="mt-6 text-2xl font-bold text-gray-800">Email Verified</h2>
    <p className="mt-2 text-gray-500">{message}</p>
    <Link
      href="/auth/login"
      className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Go to Login
    </Link>
  </div>
)

export default SuccessView