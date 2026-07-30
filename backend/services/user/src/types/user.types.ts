import { Types } from 'mongoose'

interface existingUserLoginType {
    username?: string | undefined,
    email?: string | undefined
}

interface userVerifyType {
    _id: Types.ObjectId,
    email: string,
    isVerified: boolean,
}

interface userExistsSendOtpAgainType {
    _id: Types.ObjectId,
    isVerified: boolean,
}
interface decodeType {
    _id: Types.ObjectId,
    email: string,
}

export type {
    existingUserLoginType,
    userVerifyType,
    userExistsSendOtpAgainType,
    decodeType
}