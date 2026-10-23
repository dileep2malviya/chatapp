import {Router} from 'express'
import { 
    registerUser,
    verifyUser,
    loginUser,
    ForgotPassword,
    verifyForgotPasswordEmail,
    resetPassword,
    changePassword,
    logOutUser,
    getUserProfile,
    updateUserProfile,
    getUserById,
    getAllUsers,
    getUserInBulk,
    sentOptAgainForVerify,
    // changePassword,
    // logOutUser
} from '../controllers/user.controller.js'
import { upload } from '../middleware/multer.middleware.js'
import { verifyTurnstile } from '../middleware/verifyTurnstile.middleware.js'
import { verifyJWT } from '../middleware/auth.middleware.js'
const router = Router()

router.route('/register').post(upload.single("avatar"), 
// verifyTurnstile,
 registerUser)
router.route('/verify-account').post(verifyUser)
router.route('/send-verification-otp').post(sentOptAgainForVerify)
router.route('/login').post(loginUser)
router.route('/forgot-password').post(ForgotPassword)
router.route('/verify-forgot-password-email').post(verifyForgotPasswordEmail)
router.route('/reset-password').post(resetPassword)
router.route('/change-password').post(verifyJWT, changePassword)
router.route('/logout-user').post(verifyJWT, logOutUser)
router.route('/get-user-profile').get(verifyJWT, getUserProfile)
router.route('/update-user-profile').post(verifyJWT,upload.single("avatar"), updateUserProfile)
router.route('/get-all-users').get(verifyJWT, getAllUsers)
router.route('/get-userById/:id').get(getUserById)
router.route('/bulk').post(getUserInBulk)



export default router