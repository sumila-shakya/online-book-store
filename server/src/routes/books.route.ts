import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { bookController } from "../controllers/books.controller";

const router = Router()

// LIST BOOK BY ISBN
router.post('/isbn',authMiddleware, bookController.listBookByIsbn)



router.get('/:listingId', authMiddleware, bookController.getListedBookById)
router.get('/',bookController.viewBooks)


export default router