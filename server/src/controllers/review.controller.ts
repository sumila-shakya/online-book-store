import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { parseId } from "../utils/parser";
import { reviewSchema, reviewType } from "../validator/review.validator";
import { reviewServices } from "../services/review.service";

export const reviewController = {
    async reviewBuyer(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId
            
            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }
            
            // parse the task id
            const orderId = parseId(req.params.orderId as string)

            const data: reviewType = reviewSchema.parse(req.body)

            await reviewServices.reviewBuyer(userId, orderId, data)

            res
            .status(201)
            .json(new ApiResponse(201, {}, "Buyer reviewed successfully"))
        } catch(error) {
            next(error)
        }
    },

    async reviewSeller(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId
            
            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }
            
            // parse the task id
            const orderId = parseId(req.params.orderId as string)

            const data: reviewType = reviewSchema.parse(req.body)

            await reviewServices.reviewSeller(userId, orderId, data)

            res
            .status(201)
            .json(new ApiResponse(201, {}, "Seller reviewed successfully"))
        } catch(error) {
            next(error)
        }
    }
}