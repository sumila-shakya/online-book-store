import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { parseId } from "../utils/parser";
import { ordersServices } from "../services/orders.service";

export const ordersController = {
    async placeOrder(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            // parse the task id
            const listingId = parseId(req.params.listingId as string)

            const newOrder = await ordersServices.placeOrder(userId, listingId)

            res
            .status(201)
            .json(new ApiResponse(201, newOrder, "Order placed successfully"))
        } catch(error) {
            next(error)
        }
    },

    async cancelOrder(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {
            next(error)
        }
    },

    async confirmOrderByBuyer(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {
            next(error)
        }
    },

    async confirmOrderBySeller(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {
            next(error)
        }
    }
}