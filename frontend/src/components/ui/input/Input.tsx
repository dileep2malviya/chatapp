import { Eye, EyeOff } from "lucide-react";
import { CustomInputSubmitType, CustomInputType, CustomPasswordInputType, OtpInputProps } from "./InputTypes";
import { useEffect, useRef, useState } from "react";
import React from "react";


const CustomInput = ({
    type = "text",
    labelText,
    placeholder,
    labelCss,
    inputCss,
    error,
    register,
    isDisable=false
}: CustomInputType) => {
    return (
        <div className="relative">
            <label htmlFor={labelText} className={`block text-sm font-medium text-gray-300 mb-2 ${labelCss ?? ""}`}>
                {labelText} <span className="text-red-700 text-sm">*</span>
            </label>

            <input
                id={labelText}
                type={type}
                // autoComplete={type === "email" ? "email" : "off"}
                className={`w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none ${inputCss ?? ""}`}
                disabled={isDisable}
                placeholder={placeholder}
                {...register}
            />

            {error && (
                <p className="absolute left-0 top-full z-10 whitespace-nowrap text-xs leading-4 text-red-700">
                    {error}
                </p>
            )}
        </div>
    )
};

const CustomPasswordInput = ({
    type,
    placeholder,
    labelCss,
    inputCss,
    register,
    error,
    textLabel = 'Password',
    isViewEnable = false
}: CustomPasswordInputType) => {
    const [isView, setIsView] = useState(false)
    const inputId = register.name;

    const togglePassword = () => {
        setIsView((prev) => !prev);
    };

    return (
        <div className="relative">
            <label
                htmlFor={inputId}
                className={`block text-sm font-medium text-gray-300 mb-2 ${labelCss ?? ""}`}
            >
                {textLabel} <span className="text-red-700 text-sm">*</span>
            </label>

            <div className="flex items-center w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg">
                <input
                    id={inputId}
                    type={isView ? "text" : type}
                    placeholder={placeholder}
                    {...register}
                    autoComplete="current-password"
                    className={`flex-1 bg-transparent text-white placeholder-gray-400 outline-none ${inputCss ?? ""}`}
                    
                />

                {!isView ? (
                    <Eye
                        className="cursor-pointer text-gray-400 hover:text-white"
                        onClick={togglePassword}
                        
                    />
                ) : (
                    <EyeOff
                        className="cursor-pointer text-gray-400 hover:text-white"
                        onClick={togglePassword}
                    />
                )}
            </div>
            {error && (
                <p className="absolute left-0 top-full z-10 whitespace-nowrap text-xs leading-4 text-red-700">
                    {error}
                </p>
            )}
        </div>
    )
};

const CustomSubmitInput = ({
    type = "submit",
    inputCss,
    value,
    children,
    isLoading
}: CustomInputSubmitType) => {
    return (
        <div>
            <input
                type={type}
                value={isLoading ? "Loading..." : value}
                disabled={isLoading}
                className={`w-full px-4 py-4 border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${inputCss ?? "bg-gray-700"}`}
            />
            {children}
        </div>
    )
};

const OtpInput = ({
    length = 6,
    value,
    setValue,
    error,
}: OtpInputProps) => {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const lastEmittedValue = useRef(value ?? "");
    const [digits, setDigits] = useState(() =>
        Array.from({ length }, (_, index) => value?.[index] ?? "")
    );

    useEffect(() => {
        if (value !== lastEmittedValue.current) {
            setDigits(Array.from({ length }, (_, index) => value?.[index] ?? ""));
            lastEmittedValue.current = value ?? "";
        }
    }, [length, value]);

    const updateDigits = (updatedDigits: string[]) => {
        const updatedValue = updatedDigits.join("");
        setDigits(updatedDigits);
        lastEmittedValue.current = updatedValue;
        setValue("otp", updatedValue, {
            shouldValidate: true,
        });
    };

    const handleChange = (index: number, input: string) => {
        if (!/^\d?$/.test(input)) return;

        const updatedOtp = [...digits];
        updatedOtp[index] = input;
        updateDigits(updatedOtp);

        if (input && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key !== "Backspace") return;

        if (digits[index]) {
            e.preventDefault();
            const updatedOtp = [...digits];
            updatedOtp[index] = "";
            updateDigits(updatedOtp);
        } else if (index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, length);

        if (!pasted) return;

        const updatedOtp = Array.from({ length }, (_, index) => pasted[index] ?? "");
        updateDigits(updatedOtp);

        inputsRef.current[Math.min(pasted.length, length) - 1]?.focus();
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code <span className="text-red-700">*</span>
            </label>

            <div className="flex gap-3 justify-center">
                {Array.from({ length }).map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputsRef.current[index] = el;
                        }}
                        value={digits[index]}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        maxLength={1}
                        inputMode="numeric"
                        className="w-14 h-14 rounded-lg border border-gray-600 bg-gray-700 text-center text-xl text-white outline-none focus:border-blue-500"
                    />
                ))}
            </div>

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export {
    CustomInput,
    CustomSubmitInput,
    CustomPasswordInput,
    OtpInput
};