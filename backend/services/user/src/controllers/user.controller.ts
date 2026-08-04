import { publishMessageToQueue } from '../config/rabbitmq.js'
import { checkRateLimit, deleteDataFromRedis, getRedisFunction, setRedisFunction } from '../config/redisConnection.js'
import { User, UserDocument } from '../models/user.model.js'
import { ActivityAction, decodeType, existingUserLoginType, IUserRequest, userExistsSendOtpAgainType, userVerifyType } from '../types/user.types.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiError, preparedErrorObject } from '../utils/errorApi.js'
import { apiResponse } from '../utils/responseApi.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { otpVerifyValidation, userLoginValidationType, otpVerifyValidationType, userLoginValidation, userRegisterValidationType, userRegisterValidation, sentOtpAgainValidation, sentOtpAgainValidationType, resetPasswordValidationType, resetPasswordValidation, changePasswordValidation } from '../validation/user.validation.js'
import { z } from "zod";
import { MongoDuplicateKeyErrorTypes } from '../types/mongoErrorType.js'
import { isReservedUsername } from '../utils/commonvalidation.js'
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary'
import { tokenDecode } from '../utils/tokoenDecode.js'
import { CookieOptions, Request, Response } from 'express'
import { EMAIL_QUEUE } from '../constants/queue.js'
import { UserActivity } from '../models/activity.model.js'


const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

const getOtpKey = (email: string) => {
    return `opt:${email}`
}
const getUserLoginRateLimitKey = (email: string) => {
    return `userLogin:ratelimit:${email}`
}

const generateAccessAndRefreshToken = async (user: UserDocument): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while generating access and referesh token", {})
    }
}

const generateResetPasswordToken = async (user: UserDocument): Promise<{ resetPasswordToken: string }> => {
    try {
        const resetPasswordToken = await user.generateAccessToken()

        return { resetPasswordToken }
    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while generating reset password token", {})
    }
}

const registerUser = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body ?? {}
        const validationResult: z.ZodSafeParseResult<userRegisterValidationType> = userRegisterValidation.safeParse(req.body ?? {})

        if (!validationResult.success) {
            const errors = preparedErrorObject(validationResult.error.issues)

            throw new ApiError(400, 'Validation error', errors)
        }
        await checkRateLimit({
            key: `userRegister:${email}`,
            limit: 3,
            ttl: 60
        });

        const isReserved = isReservedUsername(username)

        if (isReserved) {
            throw new ApiError(400, "Username is reserved. Please choose a different username.", { username: "Username is reserved. Please choose a different username." });
        }

        const existingUser: existingUserLoginType[] | null = await User.find(
            {
                $or: [{ username }, { email }],
            },
            {
                username: 1,
                email: 1,
            }
        ).lean();

        const errors: Record<string, string> = {};

        if (existingUser) {
            for (const user of existingUser) {
                if (user.username === username) {
                    errors.username = "Username already exists";
                }

                if (user.email === email) {
                    errors.email = "Email already exists";
                }
            }
        }

        if (Object.keys(errors).length) {
            throw new ApiError(409, "Validation failed", errors);
        }

        const avatarLocalPath: string = req.file?.path ?? ""

        let avatar: UploadApiResponse | UploadApiErrorResponse | null = null
        if (!avatarLocalPath) {
            // throw new ApiError(400, "Profile picture is required", {});
            avatar = await uploadOnCloudinary(avatarLocalPath)
        }

        // if (!avatar?.url) {
        //     throw new ApiError(400, "Profile picture is required", {})
        // }

        console.log("req.body :: ", req.body)

        const userResponse = await User.create({
            firstName,
            lastName,
            username,
            email,
            avatar: avatar?.url ? avatar.url : "",
            password
        })

        const createdUser = await User.findById(userResponse._id).select("-password -refreshToken -isDeleted -isActive -isVerified -__v").lean()

        await UserActivity.create({
            userId: userResponse._id,
            action: ActivityAction.REGISTER,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user", {})
        }

        const optCode = generateOtp()
        await setRedisFunction(getOtpKey(email), optCode, 600)
        await setRedisFunction(getUserLoginRateLimitKey(email), "true", 120)

        const message = {
            type: 'OTP',
            payload: {
                to: email,
                subject: "Your Email Verification Code",
                text: `${optCode}`
            }
        }

        await publishMessageToQueue(EMAIL_QUEUE, message)
        return res.status(201).json(apiResponse(201, createdUser, "User registered successfully"))
    } catch (error) {
        console.log("error catch", error)
        const err = error as MongoDuplicateKeyErrorTypes;

        if (err.code === 11000) {
            console.log("Duplicate key error:", err.keyPattern, err.keyValue);
            const field = Object.keys(err.keyPattern)[0];

            throw new ApiError(
                409,
                `${field} already exists`,
                { [field]: `${field} already exists` }
            );
        }

        throw error;
    }

})

const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body ?? {}
        const validationResult: z.ZodSafeParseResult<userLoginValidationType> = userLoginValidation.safeParse(req.body ?? {})

        if (!validationResult.success) {
            const errors = preparedErrorObject(validationResult.error.issues)

            throw new ApiError(400, 'Validation error', errors)
        }

        await checkRateLimit({
            key: `login:${email}`,
            limit: 3,
            ttl: 60
        });


        const currentUser: UserDocument | null = await User.findOne({ email })

        if (!currentUser) {
            throw new ApiError(401, 'Invalid credentials', {})
        }

        if (!currentUser.isVerified) {
            throw new ApiError(409, "Please verify your email before logging in.", {})
        }

        if (!currentUser.isActive) {
            throw new ApiError(403, "Your account is disabled.");
        }

        if (currentUser.isDeleted) {
            throw new ApiError(403, "Account no longer exists.");
        }

        console.info({
            userId: currentUser._id,
            email: currentUser.email,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });
        const isPasswordValid: boolean = await currentUser.isPasswordCorrect(password)

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(currentUser)

        const options: CookieOptions = {
            httpOnly: true,
            sameSite: "strict" as const,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }

        await UserActivity.create({
            userId: currentUser._id,
            action: ActivityAction.LOGIN,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });

        return res
            .status(200)
            .cookie("refreshToken", refreshToken, options)
            .json(apiResponse(200, {
                user: currentUser,
                accessToken
            },
                "User Logged In Successfully"
            )
            )
    } catch (error) {
        console.log("error: ", error)
        throw error
    }

})

const verifyUser = asyncHandler(async (req, res) => {
    try {
        const { email, otp } = req.body ?? {}
        const validationResult: z.ZodSafeParseResult<otpVerifyValidationType> = otpVerifyValidation.safeParse(req.body ?? {})

        if (!validationResult.success) {
            const errors = preparedErrorObject(validationResult.error.issues)
            throw new ApiError(400, 'Validation error', errors)
        }

        await checkRateLimit({
            key: `verify:${email}`,
            limit: 3,
            ttl: 90
        });

        const getKeyOfOtp = getOtpKey(email)
        const isValidOtp = await getRedisFunction(getKeyOfOtp)

        if (!isValidOtp || isValidOtp !== otp) {
            throw new ApiError(400, 'Otp is invalid or expired')
        }

        const currentUser = await User.findOneAndUpdate(
            {
                email,
                isVerified: false
            },
            {
                $set: {
                    isVerified: true
                }
            },
            {
                returnDocument: "after"
            }
        ).select("_id email isVerified").lean<userVerifyType | null>()

        if (currentUser) {
            await deleteDataFromRedis(getKeyOfOtp)
            return res.status(200).json(apiResponse(200, currentUser, "Verified Successfully."))
        }

        const isExist = await User.exists({ email });

        if (!isExist) {
            throw new ApiError(404, 'Invalid OTP or email', { error: "Invalid OTP or email" })
        }

        return res.status(200).json(apiResponse(200, currentUser, "User already Verified."))

    } catch (error) {
        throw error
    }

})

const sentOptAgain = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body ?? {}
        const validationResult: z.ZodSafeParseResult<sentOtpAgainValidationType> = sentOtpAgainValidation.safeParse(req.body ?? {})

        if (!validationResult.success) {
            const errors = preparedErrorObject(validationResult.error.issues)
            throw new ApiError(400, 'Validation error', errors)
        }

        await checkRateLimit({
            key: `sentOptAgain:${email}`,
            limit: 3,
            ttl: 120
        });

        const currentUser = await User.findOne({ email }).select("_id isVerified").lean<userExistsSendOtpAgainType | null>()

        if (!currentUser) {
            return res.status(200).json(
                apiResponse(
                    200,
                    null,
                    "If an account exists for this email, an OTP has been sent."
                )
            );
        }

        if (currentUser.isVerified) {
            return res.status(200).json(apiResponse(200, null, 'User is already verified.'))
        }

        const optCode = generateOtp()
        await setRedisFunction(getOtpKey(email), optCode, 120)

        const message = {
            type: 'OTP',
            payload: {
                to: email,
                subject: "Your Email Verification Code",
                text: `${optCode}`
            }
        }

        await publishMessageToQueue(EMAIL_QUEUE, message)

        return res.status(200).json(apiResponse(200, null, 'OTP has been sent to your email.'))

    } catch (error) {
        throw error
    }
})

const ForgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body ?? {}
        const validationResult: z.ZodSafeParseResult<sentOtpAgainValidationType> = sentOtpAgainValidation.safeParse(req.body ?? {})

        if (!validationResult.success) {
            const errors = preparedErrorObject(validationResult.error.issues)
            throw new ApiError(400, 'Validation error', errors)
        }

        await checkRateLimit({
            key: `forgotpassword:${email}`,
            limit: 3,
            ttl: 120
        });

        const currentUser = await User.findOne({ email }).select("_id isVerified isActive isDeleted")

        if (!currentUser) {
            return res.status(200).json(
                apiResponse(
                    200,
                    null,
                    "If an account exists for this email, a password reset OTP has been sent."
                )
            )
        }

        if (!currentUser.isVerified) {
            throw new ApiError(
                403,
                "Email address is not verified. Please verify your email first.",
                {}
            );
        }

        if (!currentUser.isActive) {
            throw new ApiError(403, "Your account is disabled.", {});
        }

        if (currentUser.isDeleted) {
            throw new ApiError(403, "Account no longer exists.", {});
        }

        const optCode = generateOtp()
        await setRedisFunction(`forgotPassword:${email}`, optCode, 120)

        const message = {
            type: 'RESET_PASSWORD',
            payload: {
                to: email,
                subject: "Your Email Verification Code",
                text: `${optCode}`
            }
        }

        await publishMessageToQueue(EMAIL_QUEUE, message)

        return res.status(200).json(apiResponse(200, null, 'If an account exists for this email, a password reset OTP has been sent.'))

    } catch (error) {
        throw error
    }
})

const verifyForgotPasswordEmail = asyncHandler(async (req, res) => {
    try {
        const { email, otp } = req.body ?? {}
        const validationResult: z.ZodSafeParseResult<otpVerifyValidationType> = otpVerifyValidation.safeParse(req.body ?? {})

        console.log("validationResult :: :: ", validationResult)
        if (!validationResult.success) {
            const errors = preparedErrorObject(validationResult.error.issues)
            throw new ApiError(400, 'Validation error', errors)
        }

        await checkRateLimit({
            key: `verifyForgotPassword:${email}`,
            limit: 3,
            ttl: 90
        });

        const redisKey = `forgotPassword:${email}`
        const savedOtp = await getRedisFunction(redisKey)

        if (!savedOtp || savedOtp !== otp) {
            throw new ApiError(400, 'Otp is invalid or expired')
        }

        const currentUser: UserDocument | null = await User.findOne({ email })

        if (!currentUser) {
            await deleteDataFromRedis(redisKey)
            throw new ApiError(404, 'Invalid OTP or email')
        }

        const { resetPasswordToken } = await generateResetPasswordToken(currentUser)

        await deleteDataFromRedis(redisKey)
        return res.status(200).json(
            apiResponse(
                200,
                {
                    resetToken: resetPasswordToken,
                },
                "OTP verified successfully. You can now reset your password."
            )
        );

    } catch (error) {
        throw error
    }
})

const resetPassword = asyncHandler(async (req, res) => {
    const validationResult = resetPasswordValidation.safeParse(req.body)

    if (!validationResult.success) {
        throw new ApiError(
            400,
            "Validation error",
            preparedErrorObject(validationResult.error.issues)
        );
    }

    await checkRateLimit({
        key: `resetPassword:${req.ip}`,
        limit: 3,
        ttl: 90
    });

    const { resetToken, newPassword } = validationResult.data

    const decoded = await tokenDecode(resetToken) as decodeType
    if (!decoded) {
        throw new ApiError(401, "Invalid or expired reset token.")
    }

    const currentUser: UserDocument | null = await User.findById(decoded._id)

    if (!currentUser) {
        throw new ApiError(404, "User not found.")
    }

    const isSamePassword = await currentUser.isPasswordCorrect(newPassword);

    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password must be different from your previous password."
        );
    }

    currentUser.password = newPassword;

    await currentUser.save();

    currentUser.refreshToken = "";
    await currentUser.save({ validateBeforeSave: false });

    await deleteDataFromRedis(`reset-password:${decoded._id}`);

    const message = {
        type: 'PASSWORD_CHANGED',
        payload: {
            to: currentUser.email,
            subject: "Your Email Verification Code",
            text: `"Your password has been changed successfully."`
        }
    }

    await publishMessageToQueue(EMAIL_QUEUE, message)

    await UserActivity.create({
        userId: currentUser._id,
        action: ActivityAction.PASSWORD_RESET,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    return res.status(200).json(
        apiResponse(
            200,
            null,
            "Password has been reset successfully. Please log in again."
        )
    );
});

const changePassword = asyncHandler(async (req: IUserRequest, res) => {
    const validationResult = changePasswordValidation.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError(
            400,
            "Validation error",
            preparedErrorObject(validationResult.error.issues)
        );
    }

    await checkRateLimit({
        key: `changePassword:${req.ip}`,
        limit: 50,
        ttl: 90
    });

    const { currentPassword, newPassword } = validationResult.data

    const currentUser: UserDocument | null = await User.findById(req?.user?._id);

    if (!currentUser) {
        throw new ApiError(401, "Unauthorized");
    }

    const isCurrentPasswordValid = await currentUser.isPasswordCorrect(currentPassword);

    if (!isCurrentPasswordValid) {
        throw new ApiError(400, "Current password is incorrect.");
    }

    const isSamePassword = await currentUser.isPasswordCorrect(newPassword)

    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password must be different from your current password."
        );
    }

    currentUser.password = newPassword
    currentUser.refreshToken = ""
    await currentUser.save({ validateBeforeSave: false })

    await UserActivity.create({
        userId: currentUser._id,
        action: ActivityAction.PASSWORD_CHANGED,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    const options: CookieOptions = {
        httpOnly: true,
        sameSite: "strict" as const,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200)
        .clearCookie("refreshToken", options)
        .json(
            apiResponse(
                200,
                null,
                "Password changed successfully. Please log in again."
            )
        );
});

const logOutUser = asyncHandler(async (req: IUserRequest, res) => {

    if (!req.user || !req.user._id) {
        throw new ApiError(401, "Unauthorized access", {});
    }

    const currentUser: UserDocument | null = await User.findById(req.user._id)

    if (!currentUser) {
        throw new ApiError(404, "User not found.");
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
                updatedAt: new Date(),
            }
        },
        {
            runValidators: false
        }
    );

    await UserActivity.create({
        userId: currentUser._id,
        action: ActivityAction.LOGOUT,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    const options: CookieOptions = {
        httpOnly: true,
        sameSite: "strict" as const,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .json(apiResponse(200, "Logged out successfully.", "Logged out successfully."))
})

export {
    registerUser,
    loginUser,
    verifyUser,
    sentOptAgain,
    ForgotPassword,
    verifyForgotPasswordEmail,
    resetPassword,
    changePassword,
    logOutUser
}


// const optCode = generateOtp()
// await setRedisFunction(getOtpKey(email), optCode, 120)
// await setRedisFunction(getUserLoginRateLimitKey(email), "true", 120)

// const message = {
//     to: email,
//     subject: "Your Verification Code",
//     body: `Your OTP is ${optCode}. It is valid for 2 minutes`
// }

// await publishMessageToQueue('send-otp', message)
// return res.status(200).json(apiResponse(200, 'true', 'OTP sent your mail'))
