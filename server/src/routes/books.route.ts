import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { bookController } from "../controllers/books.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router()

// LIST BOOK BY ISBN
router.post('/isbn',authMiddleware, bookController.listBookByIsbn)

// LIST BOOKY MANUALLY
router.post('/manual', authMiddleware, upload.single('cover'), bookController.listBookManually)

router.get('/:listingId', authMiddleware, bookController.getListedBookById)
router.get('/',bookController.viewBooks)


export default router