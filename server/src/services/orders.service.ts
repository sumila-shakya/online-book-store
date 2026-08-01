import { db } from "../config/mysql.config";
import { users, booksListings, orders, NewOrder } from "../models/mysql.model";
import { eq, and } from "drizzle-orm";
import { ApiError } from "../utils/apiError";

export const ordersServices = {
    async placeOrder(userId: number, listingId: number) {
        const [existingListing] = await db
        .select()
        .from(booksListings)
        .where(eq(booksListings.listingId, listingId))

        if(!existingListing) {
            throw new ApiError(404, "Book not found")
        }

        if(existingListing.listingStatus !== 'available') {
            throw new ApiError(4049, 'Book not available')
        }

        if(existingListing.sellerId === userId) {
            throw new ApiError(400, "Cannot buy own listed book")
        }

        const newOrder: NewOrder = {
            listingId: existingListing.listingId,
            sellerId: existingListing.sellerId,
            buyerId: userId
        }

        return await db.transaction(async(tx) => {
            const [result] = await tx
            .insert(orders)
            .values(newOrder)

            await tx
            .update(booksListings)
            .set({
                listingStatus: 'reserved'
            })
            .where(eq(booksListings.listingId, listingId))

            const [order] = await tx
            .select()
            .from(orders)
            .where(eq(orders.orderId, result.insertId))

            return order
        })
    },

    async cancelOrder(userId: number, orderId: number) {
        const [existingOrder] = await db
        .select()
        .from(orders)
        .where(and(
            eq(orders.orderId, orderId),
            eq(orders.buyerId, userId)
        ))

        if(!existingOrder) {
            throw new ApiError(403, "Access denied")
        }

        if(existingOrder.orderStatus !== 'pending') {
            throw new ApiError(409, `${existingOrder.orderStatus} order cannot be cancelled`)
        }

        await db.transaction(async(tx) => {
            await tx
            .update(orders)
            .set({
                orderStatus: 'cancelled'
            })
            .where(eq(orders.orderId, orderId))

            await tx
            .update(booksListings)
            .set({
                listingStatus: 'available'
            })
        })
    },

    async confirmOrderByBuyer() {

    },

    async confirmOrderBySeller() {

    }
}