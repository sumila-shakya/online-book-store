import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { bookController } from "../controllers/books.controller";

const router = Router()

router.post('/',authMiddleware, bookController.listBook)
router.get('/:listingId', authMiddleware, bookController.getListedBookById)


export default router