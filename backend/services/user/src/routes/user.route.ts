import {Router} from 'express'
import { 
    registerUser,
    verifyUser,
    sentOptAgain,
    loginUser,
    ForgotPassword,
    verifyForgotPasswordEmail,
    resetPassword,
    changePassword,
    logOutUser,
    // changePassword,
    // logOutUser
} from '../controllers/user.controller.js'
import { upload } from '../middleware/multer.middleware.js'
import { verifyTurnstile } from '../middleware/verifyTurnstile.middleware.js'
import { verifyJWT } from '../middleware/auth.middleware.js'
const router = Router()

router.route('/create').post(upload.single("avatar"), 
// verifyTurnstile,
 registerUser)
router.route('/verify').post(verifyUser)
router.route('/send-otp-again').post(sentOptAgain)
router.route('/login').post(loginUser)
router.route('/forgot-password').post(ForgotPassword)
router.route('/verify-forgot-password-email').post(verifyForgotPasswordEmail)
router.route('/reset-password').post(resetPassword)
router.route('/change-password').post(verifyJWT, changePassword)
router.route('/logout-user').post(verifyJWT, logOutUser)



export default router