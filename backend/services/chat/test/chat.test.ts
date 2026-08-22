import { jest, beforeEach, describe, expect, it } from "@jest/globals";
import { Types } from "mongoose";

const mock = () => jest.fn() as jest.Mock<any>;

const chatModel = {
	findOne: mock(),
	create: mock(),
	aggregate: mock(),
	findById: mock(),
	findByIdAndUpdate: mock(),
};

const messageModel = {
	create: mock(),
	find: mock(),
	updateMany: mock(),
};

const axiosPost = mock();
const checkRateLimit = mock();
const uploadOnCloudinary = mock();
const deleteOnCloudinary = mock();
const mongooseStartSession = mock();

jest.unstable_mockModule("../src/models/chat.model.js", () => ({ Chat: chatModel }));
jest.unstable_mockModule("../src/models/message.model.js", () => ({ Message: messageModel }));
jest.unstable_mockModule("../src/config/redisConnection.js", () => ({ checkRateLimit }));
jest.unstable_mockModule("../src/utils/cloudinary.js", () => ({
	uploadOnCloudinary,
	deleteOnCloudinary,
}));
jest.unstable_mockModule("axios", () => ({ default: { post: axiosPost } }));
jest.unstable_mockModule("mongoose", () => ({
	Types,
	default: { Types, startSession: mongooseStartSession },
}));

const { createChat, getAllChat, sendMessage, getMessageByChat } =
	await import("../src/controllers/chat.controller.js");

const userId = new Types.ObjectId();
const otherUserId = new Types.ObjectId();
const chatId = new Types.ObjectId();

const response = () => {
	const res = {
		status: mock(),
		json: mock(),
	} as any;
	res.status.mockReturnValue(res);
	return res;
};

const request = (body: Record<string, unknown> = {}, user: Types.ObjectId | null = userId) => ({
	body,
	user: user ? { _id: user } : undefined,
	file: undefined,
}) as any;

const invoke = async (handler: any, req: any, res: any) => {
	const next = mock();
	await handler(req, res, next);
	return next;
};

beforeEach(() => {
	jest.clearAllMocks();
	checkRateLimit.mockResolvedValue(undefined);
	uploadOnCloudinary.mockResolvedValue(null);
	deleteOnCloudinary.mockResolvedValue(undefined);
});

describe("createChat", () => {
	it("creates a chat and returns 201", async () => {
		const createdChat = { _id: chatId, participants: [userId, otherUserId] };
		chatModel.findOne.mockReturnValue({ lean: mock().mockResolvedValue(null) });
		chatModel.create.mockResolvedValue(createdChat);
		const res = response();

		const next = await invoke(
			createChat,
			request({ users: [otherUserId.toString()] }),
			res,
		);

		expect(next).not.toHaveBeenCalled();
		expect(chatModel.create).toHaveBeenCalledWith(expect.objectContaining({
			participants: [userId, otherUserId.toString()],
		}));
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			statusCode: 201,
			message: "Chat created successfully",
			success: true,
		}));
	});

	it("returns an existing chat without creating another one", async () => {
		const existingChat = { _id: chatId };
		chatModel.findOne.mockReturnValue({ lean: mock().mockResolvedValue(existingChat) });
		const res = response();

		await invoke(createChat, request({ users: [otherUserId.toString()] }), res);

		expect(chatModel.create).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			data: existingChat,
			message: "chat already exist",
		}));
	});

	it("passes validation and authentication errors to next", async () => {
		const invalidRes = response();
		const invalidNext = await invoke(createChat, request({ users: [] }), invalidRes);
		expect(invalidNext.mock.calls[0][0]).toMatchObject({ statusCode: 400 });

		const missingUserRes = response();
		const missingUserNext = await invoke(createChat, request({}, null), missingUserRes);
		expect(missingUserNext.mock.calls[0][0]).toMatchObject({
			statusCode: 404,
			message: "User not found.",
		});
	});
});

describe("getAllChat", () => {
	it("returns chats with users loaded from the user service", async () => {
		const chats = [{ participants: [userId, otherUserId], _id: chatId }];
		chatModel.aggregate.mockResolvedValue(chats);
		axiosPost.mockResolvedValue({ data: { data: [{ _id: otherUserId.toString() }] } });
		const res = response();

		await invoke(getAllChat, request(), res);

		expect(axiosPost).toHaveBeenCalledWith(
			expect.stringContaining("/api/v1/user/bulk"),
			{ userIds: [otherUserId] },
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			statusCode: 200,
			message: "Get all chat successfully",
		}));
	});

	it("rejects a request without a user", async () => {
		const next = await invoke(getAllChat, request({}, null), response());
		expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 404, message: "Missing user." });
	});
});

describe("sendMessage", () => {
	it("creates a message, updates the chat, and returns 201", async () => {
		const savedMessage = { _id: new Types.ObjectId(), text: "Hello" };
		chatModel.findById.mockReturnValue({
			select: mock().mockReturnValue({
				lean: mock().mockResolvedValue({ participants: [userId, otherUserId] }),
			}),
		});
		messageModel.create.mockResolvedValue([savedMessage]);
		chatModel.findByIdAndUpdate.mockResolvedValue(undefined);
		const session = {
			withTransaction: mock().mockImplementation(async (callback: () => Promise<void>) => callback()),
			endSession: mock().mockResolvedValue(undefined),
		};
		const res = response();

		mongooseStartSession.mockResolvedValue(session);

		await invoke(sendMessage, request({ chatId: chatId.toString(), text: "Hello" }), res);

		expect(messageModel.create).toHaveBeenCalledWith(
			[expect.objectContaining({ text: "Hello", senderId: userId })],
			{ session },
		);
		expect(chatModel.findByIdAndUpdate).toHaveBeenCalledWith(
			chatId.toString(),
			{ lastMessage: savedMessage._id },
			{ session },
		);
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			message: "Message sent successfully",
		}));
		expect(session.endSession).toHaveBeenCalled();
	});

	it("rejects a user who is not in the chat", async () => {
		chatModel.findById.mockReturnValue({
			select: mock().mockReturnValue({
				lean: mock().mockResolvedValue({ participants: [otherUserId] }),
			}),
		});

		const next = await invoke(
			sendMessage,
			request({ chatId: chatId.toString(), text: "Hello" }),
			response(),
		);

		expect(next.mock.calls[0][0]).toMatchObject({
			statusCode: 403,
			message: "You are not a participant of this chat",
		});
	});
});

describe("getMessageByChat", () => {
	it("marks unread messages and returns the conversation", async () => {
		const chat = { participants: [userId, otherUserId] };
		chatModel.findById.mockReturnValue({
			select: mock().mockResolvedValue(chat),
		});
		messageModel.find
			.mockResolvedValueOnce([{ _id: new Types.ObjectId() }])
			.mockReturnValueOnce({
				sort: mock().mockResolvedValue([{ text: "Hello" }]),
			});
		messageModel.updateMany.mockResolvedValue({ modifiedCount: 1 });
		axiosPost.mockResolvedValue({ data: { data: [] } });
		const res = response();

		await invoke(
			getMessageByChat,
			request({ chatId: chatId.toString() }),
			res,
		);

		expect(messageModel.updateMany).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			statusCode: 201,
			message: "Message retrive successfully",
		}));
	});

	it("rejects a user who is not authorized for the chat", async () => {
		chatModel.findById.mockReturnValue({
			select: mock().mockResolvedValue({ participants: [otherUserId] }),
		});

		const next = await invoke(
			getMessageByChat,
			request({ chatId: chatId.toString() }),
			response(),
		);

		expect(next.mock.calls[0][0]).toMatchObject({
			statusCode: 400,
			message: "You are unauthorize for this chat.",
		});
	});
});
