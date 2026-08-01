import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ordersController } from "../controllers/orders.controller";

const router = Router()

router.use(authMiddleware)

router.post('/:orderId', ordersController.cancelOrder)
router.post('/:orderId/buyer-confirm', ordersController.confirmOrderByBuyer)
router.post('/:orderId/seller-confirm', ordersController.confirmOrderBySeller)

export default router