import { Response, Request, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { sellerServices } from "../services/seller.service";
import { parseId } from "../utils/parser";
import { sellerListingFilterSchema, sellerListingFilterType } from "../validator/seller.validation";

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

        } catch(error) {
            next(error)
        }
    }

}
