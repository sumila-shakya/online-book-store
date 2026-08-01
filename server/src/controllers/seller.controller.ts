import { Response, Request, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { sellerServices } from "../services/seller.service";
import { parseId } from "../utils/parser";
import { sellerListingFilterSchema, sellerListingFilterType } from "../validator/seller.validation";
import { paginationSchema, paginationType } from "../validator/global.validator";

export const sellerController = {
    async viewMyListings(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            const validatedData: sellerListingFilterType = sellerListingFilterSchema.parse(req.query)

            const data = await sellerServices.viewMyListings(userId, validatedData)

            res
            .status(200)
            .json(new ApiResponse(200, data))
        } catch(error) {
            next(error)
        }
    },

    async viewSellerListings(req: Request, res: Response, next: NextFunction) {
        try {
            // parse the task id
            const sellerId = parseId(req.params.sellerId as string)

            const paginationData: paginationType = paginationSchema.parse(req.query)

            const data = await sellerServices.viewSellerListing(sellerId, paginationData)

            res
            .status(200)
            .json(new ApiResponse(200, data))
        } catch(error) {
            next(error)
        }
    }

}
