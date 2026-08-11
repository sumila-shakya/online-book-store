import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rateLimiter } from "../middlewares/rateLimit.middleware";

const router = Router()

router.post('/register', authController.registerUser)
router.post('/login', authController.loginUser)
router.post('/google', authController.signInWithGoogle)
router.post('/logout', authMiddleware, authController.logout)

router.post('/refresh', authController.refreshToken)
router.get('/my-account',authMiddleware, authController.getAccount)

router.post('/request-verification', authMiddleware, rateLimiter.verificationLimiter, authController.requestVerification)
router.post('/verify-phoneno', authMiddleware, authController.verifyPhoneNo)

export default router