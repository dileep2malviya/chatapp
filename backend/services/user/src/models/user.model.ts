import mongoose, {Document, mongo, Schema} from 'mongoose'

export interface IUser extends Document{
    name: string,
    email: string
}

const userSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }
},{timestamps:true})

export const User = mongoose.model<IUser>("User",userSchema) 