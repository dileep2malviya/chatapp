import { z } from 'zod'

const emailSchema = z.email({
    error: "Please enter a valid email address",
})
.transform((value) => value.toLowerCase())

const passwordSchema = z
    .string({
        error: "Password is required.",
    })
    .trim()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password must not exceed 128 characters.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/\d/, "Password must contain at least one number.")
    .regex(
        /[@$!%*?&^#()_\-+=]/,
        "Password must contain at least one special character."
    );

const userLoginValidation = z.object({
    email: emailSchema,
    password: z
        .string({ error: "Password is required." })
        .trim()
})
const sentOtpAgainValidation = z.object({
    email: emailSchema
})

const otpVerifyValidation = z.object({
    email: emailSchema,
    otp: z.string({error: "OTP is required."}).length(6, {
        error: "OTP must be exactly 6 digits",
    }).regex(/^\d+$/, {
        error: "OTP must contain only numbers",
    })
})
const resetPasswordValidation = z
    .object({
        resetToken: z
            .string({
                error: "Reset token is required.",
            })
            .trim()
            .min(1, "Reset token is required."),

        newPassword: passwordSchema,

        confirmPassword: z
            .string({
                error: "Confirm password is required.",
            })
            .trim(),
            
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
    })

const changePasswordValidation = z
    .object({
        currentPassword: z.string({ error: 'Current password is required.' }).trim(),
        newPassword: passwordSchema,
        confirmPassword: z.string({ error: 'Confirm password is required.' }).trim(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
    })

const userRegisterValidation = z.object({
    firstName: z
        .string({ error: "First name is required." })
        .trim()
        .min(1, "First name is required.")
        .max(20, "Maximum 20 characters allowed for first name."),
    lastName: z
        .string({ error: "Last name is required." })
        .trim()
        .min(1, "Last name is required.")
        .max(20, "Maximum 20 characters allowed for last name."),
    username: z
        .string({ error: "Username is required." })
        .trim()
        .min(3, "Username must be at least 3 characters.")
        .max(20, "Maximum 20 characters allowed for Username.")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores."
        )
        .transform((value) => value.toLowerCase()),
    email: emailSchema,
    password: passwordSchema
})

type userRegisterValidationType = z.infer<typeof userRegisterValidation>
type userLoginValidationType = z.infer<typeof userLoginValidation>
type otpVerifyValidationType = z.infer<typeof otpVerifyValidation>
type sentOtpAgainValidationType = z.infer<typeof sentOtpAgainValidation>
type resetPasswordValidationType = z.infer<typeof resetPasswordValidation>
type changePasswordValidationType = z.infer<typeof changePasswordValidation>

export type {
    userLoginValidationType,
    otpVerifyValidationType,
    userRegisterValidationType,
    sentOtpAgainValidationType,
    resetPasswordValidationType
}

export {
    sentOtpAgainValidation,
    userLoginValidation,
    otpVerifyValidation,
    userRegisterValidation,
    resetPasswordValidation,
    changePasswordValidation
}