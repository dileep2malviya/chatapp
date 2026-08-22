import { Types } from "mongoose";

export enum AttachmentType {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  FILE = "file",
}

export interface IDeliveredTo {
    user: Types.ObjectId;
    deliveredAt: Date | null;
}

export interface IReadBy {
    user: Types.ObjectId;
    readAt: Date | null;
}

interface IMessage {
    conversationId: Types.ObjectId,
    senderId: Types.ObjectId,
    text?: string,
    attachments?: {
        url: string,
        publicId?: string,
        type: AttachmentType,
        fileName?: string,
        size?: number,
    }[],
    replyTo?: Types.ObjectId,
    isEdited: boolean,
    isDeleted: boolean,
    deliveredTo: IDeliveredTo[],
    readBy?: IReadBy[],
    createdAt: Date,
    updatedAt: Date
}

interface ILastMessage {
  text: string;
  attachments: AttachmentType[];
  isDeleted: boolean;
  isSeen: boolean;
  readBy: string[];
  createdAt: string;
}

export type {
    ILastMessage,
    IMessage
}