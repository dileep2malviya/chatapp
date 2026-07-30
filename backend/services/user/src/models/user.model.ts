import mongoose, { Document, Schema, HydratedDocument,Model } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/errorApi.js'

export interface IUser extends Document {
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
}

export interface IUserMethods {
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
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
})

userSchema.methods.isPasswordCorrect = async function (password:string):Promise<boolean>{
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new ApiError(500, "JWT_SECRET is required");
    }
    return jwt.sign({
        data: {
            _id: this._id,
            email: this.email
        }
    },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
    })
}
userSchema.methods.generateRefreshToken = function () {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new ApiError(500, "JWT_SECRET is required");
    }
    return jwt.sign({
        data: {
            _id: this._id
        }
    },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '2d'
    })
}
userSchema.set("toJSON", {
  transform(_doc, ret) {
    const { password, refreshToken, isDeleted, isActive, __v, ...safeUser } = ret;
    return safeUser;
  },
});
export type UserDocument = HydratedDocument<IUser, IUserMethods>;
export const User = mongoose.model<IUser>("User", userSchema)