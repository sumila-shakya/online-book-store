import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router()

router.post('/register', authController.registerUser)
router.post('/login', authController.loginUser)
router.post('/google', authController.signInWithGoogle)
router.post('/logout', authMiddleware, authController.logout)
router.post('/refresh', authController.refreshToken)

export default router