import mongoose, { Schema, Document } from 'mongoose'
import { IMessage } from '../types/message.types.js'

const messageSchema: Schema<IMessage> = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true,
    },

    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    text: {
        type: String,
        trim: true,
        maxlength: 5000,
    },

    attachments: [
        {
            url: String,
            publicId: String,
            type: {
                type: String,
                enum: ["image", "video", "audio", "file"],
            },
            fileName: String,
            size: Number,
        },
    ],

    replyTo: {
        type: Schema.Types.ObjectId,
        ref: "Message",
    },

    isEdited: {
        type: Boolean,
        default: false,
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },

    deliveredTo: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            deliveredAt: {
                type: Date,
                default: null,
            },
        },
    ],

    readBy: [
        {
            user: {
                type: Schema.Types.ObjectId,
            },
            readAt: {
                type: Date,
                default: null,
            },
        },
    ],
},
    {
        timestamps: true,
    })

export const Message = mongoose.model<IMessage>('Message', messageSchema)