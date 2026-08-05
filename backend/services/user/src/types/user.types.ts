import { Types, Document } from 'mongoose'
import { Request } from 'express'

interface IUser extends Document {
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    avatar: string,
    password: string,
    refreshToken: string,
    isVerified: boolean,
    isActive: boolean,
    isDeleted: boolean,
    createdAt: Date,
    updatedAt: Date
}

interface IUserRequest extends Request {
    user?: IUser
}

// interface UserParams {
//     id: string;
// }

// type IUserRequestParam = Request<UserParams>;

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

interface userSearchType {
    isDeleted: boolean;
    isVerified: boolean;
    isActive: boolean;
    _id: { $ne: Types.ObjectId };
    $or?: object[];
}


export enum ActivityAction {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    REGISTER = "REGISTER",
    PASSWORD_CHANGED = "PASSWORD_CHANGED",
    PASSWORD_RESET = "PASSWORD_RESET",
    PROFILE_UPDATED = "PROFILE_UPDATED",
    ACCOUNT_DELETED = "ACCOUNT_DELETED",
}

interface IUserActivity extends Document {
    userId: Types.ObjectId,
    action: ActivityAction,
    ip?: string,
    userAgent?: string,
    createdAt: Date,
    updatedAt: Date,
}

type UpdateProfileData = {
    firstName?: string;
    lastName?: string;
    avatar?: string;
};

export type {
    existingUserLoginType,
    userVerifyType,
    userExistsSendOtpAgainType,
    decodeType,
    IUser,
    IUserRequest,
    UpdateProfileData,
    IUserActivity,
    userSearchType,
    // UserParams,
    // IUserRequestParam
}