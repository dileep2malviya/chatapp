import mongoose, { Schema } from "mongoose";
import { ActivityAction, IUserActivity } from "../types/user.types.js";

const userActivitySchema: Schema<IUserActivity> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        action: {
            type: String,
            enum: Object.values(ActivityAction),
            required: [ true, 'Action is required' ],
        },
        ip: {
            type: String,
        },

        userAgent: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const UserActivity = mongoose.model('UserActivity', userActivitySchema);