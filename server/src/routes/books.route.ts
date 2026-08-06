import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { bookController } from "../controllers/books.controller";
import { upload } from "../middlewares/multer.middleware";
import { ordersController } from "../controllers/orders.controller";
import { requirePhoneVerified } from "../middlewares/phone.middleware";

const router = Router()

router.post('/isbn',authMiddleware, requirePhoneVerified, bookController.listBookByIsbn)
router.post('/manual', authMiddleware, requirePhoneVerified, upload.single('cover'), bookController.listBookManually)

// does not require phone number to be verified
router.get('/:listingId', authMiddleware, bookController.getListedBookById)

// BROWSE BOOKS (SEARCH BY TITLE, AUTHOR, DESCRIPTION, ISBN)
router.get('/',bookController.viewBooks)

/* ------------------------------------ ORDER ROUTES ------------------------------------ */
router.post('/:listingId/place-order', authMiddleware, requirePhoneVerified, ordersController.placeOrder)


export default router