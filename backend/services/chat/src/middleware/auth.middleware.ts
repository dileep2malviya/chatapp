import { NextFunction, Response } from "express";
import { decodeType, IUserRequest } from "../types/user.types.js";
import { ApiError } from "../utils/errorApi.js";
import { tokenDecode } from "../utils/tokoenDecode.js";
import { Types } from "mongoose";

const verifyJWT = async (req: IUserRequest, res: Response, next: NextFunction) => {
    console.log("dsdsds")
    try {
        const authHeader = req.headers?.authorization?.toString() || req.headers.Authorization?.toString();
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if (!token) {
            throw new ApiError(401, "Authentication required.");
        }

        const decodeedData = await tokenDecode(token) as decodeType;

        console.log("decodeedData :: ", decodeedData)

        if (!decodeedData?._id) {
            throw new ApiError(401, "Invalid or expired token.");
        }

        if (!Types.ObjectId.isValid(decodeedData?._id)) {
            throw new ApiError(401, "Invalid user.");
        }

        // const userId = decodeedData?._id;

        // const currentUser = await User.findById(userId).select("-password -refreshToken -__v").lean()

        // if (!currentUser) {
        //     throw new ApiError(401, "Authentication required.");
        // }

        req.user = decodeedData;
        next()
    } catch (error) {
        next(error)
    }
}

export {
    verifyJWT
}