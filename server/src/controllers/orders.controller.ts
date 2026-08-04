import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { parseId } from "../utils/parser";
import { ordersServices } from "../services/orders.service";
import { orderFilterSchema, orderFilterType } from "../validator/orders.validator";
import { Order } from "../models/mysql.model";

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

            const newOrder: Order = await ordersServices.placeOrder(userId, listingId)

            res
            .status(201)
            .json(new ApiResponse(201, newOrder, "Order placed successfully"))
        } catch(error) {
            next(error)
        }
    },

    async cancelOrder(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            // parse the task id
            const orderId = parseId(req.params.orderId as string)

            await ordersServices.cancelOrder(userId, orderId)

            res
            .status(200)
            .json(new ApiResponse(200, {}, "Order cancelled successfully"))
        } catch(error) {
            next(error)
        }
    },

    async confirmOrderByBuyer(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            // parse the task id
            const orderId = parseId(req.params.orderId as string)

            await ordersServices.confirmOrderByBuyer(userId, orderId)

            res
            .status(200)
            .json(new ApiResponse(200, {}, "Buyer confirmation received successfully"))
        } catch(error) {
            next(error)
        }
    },

    async confirmOrderBySeller(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            // parse the task id
            const orderId = parseId(req.params.orderId as string)

            await ordersServices.confirmOrderBySeller(userId, orderId)

            res
            .status(200)
            .json(new ApiResponse(200, {}, "Seller confirmation received successfully"))
        } catch(error) {
            next(error)
        }
    },

    async viewPurchaseOrders(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            const filters: orderFilterType = orderFilterSchema.parse(req.query)

            const data = await ordersServices.viewPurchaseOrder(userId, filters)

            res
            .status(200)
            .json(new ApiResponse(200, data))
        } catch(error) {
            next(error)
        }
    },

    async viewSalesOrders(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            const filters: orderFilterType = orderFilterSchema.parse(req.query)

            const data = await ordersServices.viewSalesOrder(userId, filters)

            res
            .status(200)
            .json(new ApiResponse(200, data))
        } catch(error) {
            next(error)
        }
    },

    async viewOrderDetails(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            // parse the task id
            const orderId = parseId(req.params.orderId as string)

            const data = await ordersServices.viewOrderDetails(userId, orderId)

            res
            .status(200)
            .json(new ApiResponse(200, data))
        } catch(error) {
            next(error)
        }
    }
}