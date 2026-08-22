import { Request } from "express";
import { Types } from "mongoose";

interface decodeType {
    _id: Types.ObjectId,
    email: string,
}

interface IUser {
    _id: Types.ObjectId,
    // name: string,
    email: string,
}
interface IUserRequest extends Request {
    user?: IUser | null
}

interface IUserChat {
  _id: Types.ObjectId;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  isVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface unKnowUser {
    _id: Types.ObjectId,
    name: string
}

interface userBulkType {
    _id: string,    
    username: string,
    email: string,
    avatar: string,
}

interface OtherUserDataType {
    [key: string]: userBulkType;
}


export type {
    decodeType,
    IUser,
    IUserRequest,
    IUserChat,
    unKnowUser,
    userBulkType,
    OtherUserDataType
}
