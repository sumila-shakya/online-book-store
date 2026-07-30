import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { bookServices } from "../services/books.service";
import { bookListingSchema, bookListingType } from "../validator/books.validator";

export const bookController = {
    async listBook(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            const data: bookListingType = bookListingSchema.parse(req.body)

            const result = await bookServices.listBook(userId, data)

            res
            .status(201)
            .json(new ApiResponse(201, result, "Book listed successfully"))
        } catch(error) {
            next(error)
        }
    }
}