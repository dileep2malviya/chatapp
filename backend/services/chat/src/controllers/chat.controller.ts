import axios from 'axios';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';
import { IUserRequest, OtherUserDataType, userBulkType } from '../types/user.types.js';
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError, preparedErrorObject } from '../utils/errorApi.js';
import { apiResponse } from '../utils/responseApi.js';
import mongoose, { Types } from 'mongoose';
import { createChatValidation, getMessageValidation, sendMessageValidation } from '../validation/chat.validation.js';
import { UploadApiResponse } from 'cloudinary';
import { UploadApiErrorResponse } from 'cloudinary';
import { deleteOnCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { IChat, IChatResponse, IChatResult } from '../types/chat.types.js';
import { checkRateLimit } from '../config/redisConnection.js';
import { generateChatKey } from '../utils/commomFunction.js';
import { AttachmentType, IMessage } from '../types/message.types.js';

const createChat = asyncHandler(async (req: IUserRequest, res) => {

    if (!req.user || !req.user._id) {
        throw new ApiError(404, "User not found.");
    }

    const { _id } = req.user;

    const { users } = req.body;

    const validationResult = createChatValidation.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError(
            400,
            "Validation error",
            preparedErrorObject(validationResult.error.issues)
        );
    }

    await checkRateLimit({
        key: `create:${_id}`,
        limit: 10,
        ttl: 60
    });

    const chatKey = generateChatKey(users)

    const existingChat: IChat | null = await Chat.findOne({
        chatKey
    }).lean<IChat>()

    if (existingChat) {
        return res.status(200).json(apiResponse(200, existingChat, "chat already exist"));
    }

    const chat = await Chat.create({
        participants: [_id, ...users],
        chatKey
    })

    return res.status(201).json(apiResponse(201, chat, 'Chat created successfully'))
})

const getAllChat = asyncHandler(async (req: IUserRequest, res) => {
    if (!req.user || !req.user._id) {
        throw new ApiError(404, "Missing user.");
    }

    const { _id } = req.user

    const chats: IChatResponse[] | null = await Chat.aggregate([
        {
            $match: {
                participants: new mongoose.Types.ObjectId(_id),
            },
        },
        {
            $sort: {
                updatedAt: -1
            }
        },
        {
            $lookup: {
                from: "messages",
                localField: "_id",
                foreignField: "conversationId",
                as: "unseeCount",
                pipeline: [
                    {
                        $match: {
                            senderId: {
                                $ne: _id
                            },
                            "readBy.user": { $ne: _id }
                        }
                    },
                    {
                        $count: "count"
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "messages",
                localField: "lastMessage",
                foreignField: "_id",
                as: "lastMessage",
            }
        },
        {
            $unwind: {
                path: "$lastMessage",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $addFields: {
                unseeCount: {
                    $ifNull: [
                        {
                            $arrayElemAt: ["$unseeCount.count", 0]
                        },
                        0
                    ]
                }
            }
        },
        {
            $project: {
                "lastMessage._id": 0,
                "lastMessage.conversationId": 0,
                "lastMessage.senderId": 0,
                "lastMessage.updatedAt": 0,
                "lastMessage.isEdited": 0,
                "lastMessage.deliveredTo": 0,
                "lastMessage.attachments.publicId": 0,
                "lastMessage.attachments.fileName": 0,
                "lastMessage.attachments.size": 0,
                "lastMessage.attachments._id": 0,
                "lastMessage.__v": 0,
                "__v": 0,
            }
        }

    ])

    const otherUserIds = [
        ...new Set(
            chats.flatMap(chat =>
                chat.participants.filter(id => id.toString() !== _id.toString())
            )
        )
    ]

    const usersMap: userBulkType[] = await getBulkUser(otherUserIds)

    const result: IChatResult[] = chats.map((chat) => {
        const otherUserId = chat.participants.find(
            (id: string) => id.toString() !== _id.toString()
        ) as string;

        const userId = new Types.ObjectId(_id);

        if (!otherUserId) {
            return {
                otherUser: {
                    _id: userId,
                    name: "Unknown User",
                },
                chat,
            }
        }

        // const otherUser = usersMap[otherUserId]

        return {
            otherUser: usersMap ?? {
                _id: userId,
                name: "Unknown User",
            },
            chat,
        }
    }
    )

    return res.status(200).json(apiResponse(200, result, 'Get all chat successfully'))
})

const sendMessage = asyncHandler(async (req: IUserRequest, res) => {
    const senderId = req.user?._id
    const imageFile = req.file

    if (!senderId) {
        throw new ApiError(401, "Invalid user.");
    }

    const validationResult = sendMessageValidation.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError(
            400,
            "Validation error",
            preparedErrorObject(validationResult.error.issues)
        );
    }

    const { chatId, text } = validationResult.data;

    const chat = await Chat.findById(chatId).select("_id participants").lean<IChat>()

    if (!chat) {
        throw new ApiError(404, "Chat not found.");
    }

    let otherUserId: Types.ObjectId | undefined;
    let isParticipant = false;

    for (const participant of chat.participants) {
        if (participant.equals(senderId)) {
            isParticipant = true;
        } else {
            otherUserId = participant;
        }
    }

    if (!isParticipant) {
        throw new ApiError(403, "You are not a participant of this chat");
    }

    if (!otherUserId) {
        throw new ApiError(409, "Conversation has no recipient.");
    }

    const attachmentLocalPath: string = req.file?.path ?? ""

    let attachment: UploadApiResponse | UploadApiErrorResponse | null = attachmentLocalPath ? await uploadOnCloudinary(attachmentLocalPath) : null

    if (imageFile && !attachment) {
        throw new ApiError(500, "Image upload failed");
    }

    //socket setup

    const messageData: Omit<IMessage, "isEdited" | "isDeleted" | "createdAt" | "updatedAt"> = {
        conversationId: new Types.ObjectId(chatId),
        senderId: senderId,
        deliveredTo: [],
        attachments: [],
        text: text ?? ""
    }

    if (imageFile) {
        messageData.attachments = [{
            url: attachment?.url ?? "",
            publicId: attachment?.public_id,
            fileName: imageFile.filename,
            type: AttachmentType["IMAGE"],
            size: imageFile.size || 0
        }];
    }

    const session = await mongoose.startSession();

    let saveMessage: IMessage & { _id: Types.ObjectId } | null = null

    try {
        await session.withTransaction(async () => {
            const [message] = await Message.create([messageData], {
                session
            });

            saveMessage = message

            await Chat.findByIdAndUpdate(chatId, {
                lastMessage: saveMessage._id,
            }, {
                session
            });

        })

        return res.status(201).json(apiResponse(201, {
            message: saveMessage,
            senderId: senderId
        }, 'Message sent successfully'))
    } catch (error) {
        if (attachment?.public_id) {
            await deleteOnCloudinary(attachment.public_id);
        }
    } finally {
        await session.endSession();
    }

})

const getMessageByChat = asyncHandler(async (req: IUserRequest, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "Invalid user ddd.");
    }

    const validationResult = getMessageValidation.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError(
            400,
            "Validation error",
            preparedErrorObject(validationResult.error.issues)
        );
    }

    const { chatId } = validationResult.data;

    const chat = await Chat.findById(chatId).select("_id participants")

    if (!chat) {
        throw new ApiError(400, "Unable to find chat.");
    }

    const isValidUser = chat.participants.find(
        participant => participant.equals(userId)
    );

    if(!isValidUser){
         throw new ApiError(400, "You are unauthorize for this chat.");
    }

    const messageToMarkUnSeen = await Message.find({
        conversationId: chatId,
        senderId: {$ne: userId},
        "readBy.user": { $ne: userId }
    })

    await Message.updateMany(
        {
            conversationId: chatId,
            senderId: {$ne: userId},
            "readBy.user": { $ne: userId }
        },
        {
            $push: {
                readBy:{
                    user: userId,
                    readAt: new Date()
                }
            }
        }
    )

    const messages = await Message.find({conversationId: chatId}).sort({createdAt: -1})

    const otherUsers: Types.ObjectId[] = chat.participants.filter((id) => id.toString() !== userId.toString())

    const usersMap: userBulkType[] = await getBulkUser(otherUsers)

    return res.status(201).json(apiResponse(201, {
            otherUsers: usersMap,
            message: messages,
        }, 'Message retrive successfully'))
})


const getBulkUser = async (data: string[] | Types.ObjectId[]): Promise<userBulkType[]> => {
    try {
        const { data: response } = await axios.post(
            `${process.env.USER_SERVICE}/api/v1/user/bulk`, { userIds: data }
        );
        return response.data
    } catch (error) {
        console.error(error);
        return []
    }
}



export {
    createChat,
    getAllChat,
    sendMessage,
    getMessageByChat
}