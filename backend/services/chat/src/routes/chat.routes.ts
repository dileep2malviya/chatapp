import express from 'express';
import { createChat, getAllChat, getMessageByChat, sendMessage } from '../controllers/chat.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = express.Router();

router.route('/create-chat').post(verifyJWT,createChat);
router.route('/get-all-chat-by-user').get(verifyJWT,getAllChat);
router.route('/create-message').post(verifyJWT,upload.single("image"),sendMessage);
router.route('/get-message-by-chat').post(verifyJWT,getMessageByChat);

export default router;