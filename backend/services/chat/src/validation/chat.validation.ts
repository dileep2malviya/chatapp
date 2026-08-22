import { Types } from 'mongoose';
import { z } from 'zod'

const createChatValidation = z.object({
  users: z
    .array(
      z.string().refine(
        (id) => Types.ObjectId.isValid(id),
        { message: "Invalid User ID" }
      )
    )
    .min(1, "At least one user is required"),
})

const sendMessageValidation = z.object({
  chatId: z
    .string()
    .refine((value) => Types.ObjectId.isValid(value), {
      message: "Invalid chat ID.",
    }),

  text: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .optional(),
});

const getMessageValidation = z.object({
  chatId: z
    .string()
    .refine((value) => Types.ObjectId.isValid(value), {
      message: "Invalid chat ID.",
    }),
});

type createChatValidationType = z.infer<typeof createChatValidation>
type sendMessageValidationType = z.infer<typeof sendMessageValidation>
type getMessageValidationType = z.infer<typeof getMessageValidation>

export type{
  createChatValidationType,
  sendMessageValidationType,
  getMessageValidationType
}

export {
  createChatValidation,
  sendMessageValidation,
  getMessageValidation
  
}