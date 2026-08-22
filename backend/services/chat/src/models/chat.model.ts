import mongoose, { Schema, Document } from 'mongoose'
import { IChat } from '../types/chat.types.js'

const chatSchema: Schema<IChat> = new Schema({
    participants: [
        {
            type: Schema.Types.ObjectId,
            required: true,
        },
    ],

    chatKey: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    type: {
        type: String,
        enum: ["direct", "group"],
        default: "direct",
        required: true,
    },

    name: {
        type: String,
        trim: true,
        maxlength: 100,
    },

    avatar: {
        type: String,
        default: "",
    },

    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message",
    },

    admins: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    isDeleted: {
        type: Boolean,
        default: false,
    },
},
    {
        timestamps: true,
    })

export const Chat = mongoose.model<IChat>('Chat', chatSchema)