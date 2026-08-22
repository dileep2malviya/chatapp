import { Document, Types } from "mongoose";
import { ILastMessage } from "./message.types.js";
import { IUserChat, unKnowUser, userBulkType } from "./user.types.js";

interface IChat extends Document {
    participants: Types.ObjectId[],
    chatKey: string,
    type: "direct" | "group",
    name?: string,
    avatar?: string,
    lastMessage?: Types.ObjectId,
    createdBy?: Types.ObjectId,
    admins: Types.ObjectId[],
    isDeleted: boolean,
}

interface IChatResponse {
  _id: Types.ObjectId;
  participants: string[];
  type: "direct" | "group";
  avatar: string;
  admins: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage: ILastMessage | null;
  unseeCount: number;
}

interface IChatResult {
    otherUser: userBulkType[] | unKnowUser,
    chat: IChatResponse
}


export type {
    IChatResponse ,
    IChat,
    IChatResult
}