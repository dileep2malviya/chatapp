import { z } from 'zod';

const emailSchema = z.email({
    error: "Enter a valid email",
})

const passwordScehma = z
        .string()
        .min(8, 'Password must be at least 8 characters')

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(100, 'First name must be less than 100 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100, 'Last name must be less than 100 characters'),
    username: z.string().min(2, 'Username must be at least 2 characters').max(100, 'Username must be less than 100 characters'),
    email: emailSchema,
    password: passwordScehma,
    confirmPassword: z
        .string({
            error: "Confirm password is required.",
        })
        .trim(),
    avatar: z
        .string()
        .optional()
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
})

const loginSchema = z.object({
    email: emailSchema,
    password: passwordScehma
})

const otpVerifySchema = z.object({
    email: emailSchema.optional(),
    otp: z
        .string()
        .length(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only numbers"),
})
const accountVerifySchema = z.object({
    email: emailSchema.optional(),
    token: z.string()
})

const ForgotPasswordSchema = z.object({
    email: emailSchema,
    otpResendAllowedAt: z.string().optional(),
})

const ResetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,}$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),

    confirmPassword: z
        .string({
            error: "Confirm password is required.",
        })
        .trim(),

}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
})


const againAccountVerifySchema = z.object({
    email: emailSchema
})



export type LoginFormValuesType = z.infer<typeof loginSchema>;
export type RegisterFormValuesType = z.infer<typeof registerSchema>;
export type OtpVerifySchemaType = z.infer<typeof otpVerifySchema>;
export type AccountVerifySchemaType = z.infer<typeof accountVerifySchema>;
export type AgainAccountVerifySchemaType = z.infer<typeof againAccountVerifySchema>;
export type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

export {
    loginSchema,
    registerSchema,
    otpVerifySchema,
    accountVerifySchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    againAccountVerifySchema
}