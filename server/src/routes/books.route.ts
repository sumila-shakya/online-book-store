import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { bookController } from "../controllers/books.controller";
import { upload } from "../middlewares/multer.middleware";
import { ordersController } from "../controllers/orders.controller";

const router = Router()

// LIST BOOK BY ISBN
router.post('/isbn',authMiddleware, bookController.listBookByIsbn)

// LIST BOOK MANUALLY
router.post('/manual', authMiddleware, upload.single('cover'), bookController.listBookManually)

// GET BOOK BY ID MANUALLY
router.get('/:listingId', authMiddleware, bookController.getListedBookById)

// BROWSE BOOKS (SEARCH BY TITLE, AUTHOR, DESCRIPTION, ISBN)
router.get('/',bookController.viewBooks)

/* ------------------------------------ ORDER ROUTES ------------------------------------ */
router.post('/:listingId/place-order', authMiddleware, ordersController.placeOrder)


export default router