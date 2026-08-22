import { Types } from "mongoose";

function generateChatKey(ids: Types.ObjectId[]) {
    return ids
        .map(id => id.toString())
        .sort()
        .join(":");
}

export {
    generateChatKey
}