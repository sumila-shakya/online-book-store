import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { sellerController } from "../controllers/seller.controller";
import { requirePhoneVerified } from "../middlewares/phone.middleware";

const router = Router()

router.get('/my-list', authMiddleware, requirePhoneVerified, sellerController.viewMyListings)
router.get('/:sellerId', sellerController.viewSellerListings)

export default router

