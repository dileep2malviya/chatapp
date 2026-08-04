import { NextFunction, Response } from "express";
import { decodeType, IUserRequest } from "../types/user.types.js";
import { ApiError } from "../utils/errorApi.js";
import { tokenDecode } from "../utils/tokoenDecode.js";
import { User } from "../models/user.model.js";
import { JwtPayload } from "jsonwebtoken";

const verifyJWT = async (req: IUserRequest, res: Response, next: NextFunction) => {
    try {
        console.log("req.headers :: ",req.headers)
        const authHeader = req.headers?.authorization?.toString() || req.headers.Authorization?.toString();
        console.log("authHeader JWT...",authHeader);
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;


        if (!token) {
            throw new ApiError(401, 'Unauthorized access', {});
        }

        const decodeedData = await tokenDecode(token) as decodeType;

        if (!decodeedData?._id) {
            throw new ApiError(401, 'Unauthorized access', {});
        }

        const userId = decodeedData?._id;

        const currentUser = await User.findById(userId).select("-password -refreshToken -__v").lean()

        if (!currentUser) {
            throw new ApiError(401, 'Unauthorized access', {});
        }

        req.user = currentUser;
        next()
    } catch (error) {
        next(error)
    }
}

export {
    verifyJWT
}