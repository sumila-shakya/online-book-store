import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { sellerController } from "../controllers/seller.controller";

const router = Router()

router.use('/my-list', authMiddleware, sellerController.viewMyListings)
router.use('/:sellerId', sellerController.viewSellerListings)

export default router

