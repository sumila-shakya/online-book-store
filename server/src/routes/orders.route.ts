import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ordersController } from "../controllers/orders.controller";
import { reviewController } from "../controllers/review.controller";
import { requirePhoneVerified } from "../middlewares/phone.middleware";

const router = Router()

router.use(authMiddleware)
router.use(requirePhoneVerified)

router.post('/:orderId', ordersController.cancelOrder)
router.post('/:orderId/buyer-confirm', ordersController.confirmOrderByBuyer)
router.post('/:orderId/seller-confirm', ordersController.confirmOrderBySeller)

router.get('/purchase', ordersController.viewPurchaseOrders)
router.get('/sales', ordersController.viewSalesOrders)
router.get('/:orderId', ordersController.viewOrderDetails)

/* ------------------------------------ REVIEW ROUTES ------------------------------------ */
router.post('/:orderId/review-buyer', reviewController.reviewBuyer)
router.post('/:orderId/review-seller', reviewController.reviewSeller)

export default router