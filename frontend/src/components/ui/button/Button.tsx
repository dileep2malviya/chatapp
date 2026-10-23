import Spinner from "../loader/buttonspinner";
import { CustomButtonProps } from "./ButtonTypes";

export default function CustomButton({
  type = "button",
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  onclick,
  children,
  className
}: CustomButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onclick}
      className={`w-full px-4 py-4 border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${className ?? "bg-gray-700"}`}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}