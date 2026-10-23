import mongoose, { Document, Schema, HydratedDocument,Model } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt, { SignOptions } from 'jsonwebtoken'
import { ApiError } from '../utils/errorApi.js'
import { IUser } from '../types/user.types.js';

export interface IUserMethods {
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(expiresIn?: SignOptions['expiresIn']): string;
    generateRefreshToken(expiresIn?: SignOptions['expiresIn']): string;
    generateEmailVerificationToken(expiresIn?: SignOptions['expiresIn']): string;
}

const userSchema: Schema<IUser> = new Schema<IUser, Model<IUser>, IUserMethods>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 25
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
    },
    avatar: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken: {
        type: String
    },
    emailVerifyToken: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

userSchema.pre("save", async function (this: HydratedDocument<IUser>) {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10)
    this.updatedAt = new Date()
})



userSchema.methods.isPasswordCorrect = async function (password:string):Promise<boolean>{
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateEmailVerificationToken = function (expiresIn: SignOptions['expiresIn'] = '1m') {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error("ACCESS_TOKEN_SECRET is not defined in environment variables");
        throw new ApiError(500, "Invalid server configuration")
    }
    const token = jwt.sign({
        data: {
            _id: this._id,
            email: this.email
        }
    },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn
    })
    this.emailVerifyToken = token;
    return token;
}

userSchema.methods.generateAccessToken = function (expiresIn: SignOptions['expiresIn'] = '60m') {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error("ACCESS_TOKEN_SECRET is not defined in environment variables");
        throw new ApiError(500, "Invalid server configuration")
    }
    return jwt.sign({
        data: {
            _id: this._id,
            email: this.email
        }
    },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn
    })
}
userSchema.methods.generateRefreshToken = function (expiresIn: SignOptions['expiresIn'] = '2d') {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error("ACCESS_TOKEN_SECRET is not defined in environment variables");
        throw new ApiError(500, "Invalid server configuration");
    }
    return jwt.sign({
        data: {
            _id: this._id
        }
    },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn
    })
}
userSchema.set("toJSON", {
  transform(_doc, ret) {
    const { password, refreshToken, isDeleted, isActive, __v, ...safeUser } = ret;
    return safeUser;
  },
});
export type UserDocument = HydratedDocument<IUser, IUserMethods>;
export const User = mongoose.model<IUser, Model<IUser, {}, IUserMethods>>("User", userSchema)