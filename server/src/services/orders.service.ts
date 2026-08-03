import { db } from "../config/mysql.config";
import { users, booksListings, orders, booksCatalogue, NewOrder } from "../models/mysql.model";
import { eq, and, desc, asc, count, SQL, lt, inArray } from "drizzle-orm";
import { ApiError } from "../utils/apiError";
import { orderFilterType } from "../validator/orders.validator";
import { DEFAULT_PAGE_LIMIT, GRACE_PERIOD } from "../utils/constants";

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
        .where(eq(orders.orderId, orderId))

        if(!existingOrder) {
            throw new ApiError(404, "Not found")
        }

        if(userId !== existingOrder.buyerId && userId !== existingOrder.sellerId) {
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
            .where(eq(booksListings.listingId, existingOrder.listingId))
        })
    },

    async confirmOrderByBuyer(userId: number, orderId: number) {
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
            throw new ApiError(409, `${existingOrder.orderStatus} order cannot be processed`)
        }

        await db
        .update(orders)
        .set({
            orderStatus: 'product_received',
            buyerVerifiedAt: new Date()
        })
        .where(eq(orders.orderId, orderId))
    },

    async confirmOrderBySeller(userId: number, orderId: number) {
        const [existingOrder] = await db
        .select()
        .from(orders)
        .where(and(
            eq(orders.orderId, orderId),
            eq(orders.sellerId, userId)
        ))

        if(!existingOrder) {
            throw new ApiError(403, "Access denied")
        }

        if(existingOrder.orderStatus !== 'product_received') {
            throw new ApiError(409, `${existingOrder.orderStatus} order cannot be processed`)
        }

        await db.transaction(async (tx) => {
            await tx
            .update(orders)
            .set({
                orderStatus: 'successful',
                sellerVerifiedAt: new Date()
            })
            .where(eq(orders.orderId, orderId))

            await tx
            .update(booksListings)
            .set({
                listingStatus: 'sold'
            })
            .where(eq(booksListings.listingId, existingOrder.listingId))
        })
    },

    async viewPurchaseOrder(userId: number, filters: orderFilterType) {
        // get the pagination data
        const page = filters.page || 1
        const limit = filters.limit || DEFAULT_PAGE_LIMIT
        const offset = (page - 1)*limit
                
        const queryFilters = [eq(orders.buyerId, userId)]

        if(filters.orderStatus) {
            queryFilters.push(eq(orders.orderStatus, filters.orderStatus))
        }

        const [purchaseOrders, [orderCount]] = await Promise.all([
            db
            .select({
                orderId: orders.orderId,
                orderStatus: orders.orderStatus,
                orderedAt: orders.orderedAt,
                listingId: orders.listingId,
                title: booksCatalogue.title,
                imageUrl: booksCatalogue.imageUrl,
                price: booksListings.price,
                sellerId: orders.sellerId,
                sellerName: users.name
            })
            .from(orders)
            .innerJoin(users, eq(users.userId, orders.sellerId))
            .innerJoin(booksListings, eq(booksListings.listingId, orders.listingId))
            .innerJoin(booksCatalogue, eq(booksCatalogue.bookId, booksListings.bookId))
            .where(and(...queryFilters))
            .orderBy(desc(orders.orderedAt), asc(orders.orderId))
            .limit(limit)
            .offset(offset),

            db
            .select({
                total: count()
            })
            .from(orders)
            .where(and(...queryFilters))
        ])

        return {
            paginationInfo: {
                totalBooksCount: orderCount.total,
                totalPages: Math.ceil(orderCount.total/limit),
                page: page,
                limit: limit
            },
            purchaseOrders
        }
    },

    async viewSalesOrder(userId: number, filters: orderFilterType) {
        // get the pagination data
        const page = filters.page || 1
        const limit = filters.limit || DEFAULT_PAGE_LIMIT
        const offset = (page - 1)*limit
                
        const queryFilters = [eq(orders.sellerId, userId)]

        if(filters.orderStatus) {
            queryFilters.push(eq(orders.orderStatus, filters.orderStatus))
        }

        const [salesOrders, [orderCount]] = await Promise.all([
            db
            .select({
                orderId: orders.orderId,
                orderStatus: orders.orderStatus,
                orderedAt: orders.orderedAt,
                listingId: orders.listingId,
                title: booksCatalogue.title,
                imageUrl: booksCatalogue.imageUrl,
                price: booksListings.price,
                buyerId: orders.sellerId,
                buyerName: users.name
            })
            .from(orders)
            .innerJoin(users, eq(users.userId, orders.buyerId))
            .innerJoin(booksListings, eq(booksListings.listingId, orders.listingId))
            .innerJoin(booksCatalogue, eq(booksCatalogue.bookId, booksListings.bookId))
            .where(and(...queryFilters))
            .orderBy(desc(orders.orderedAt), asc(orders.orderId))
            .limit(limit)
            .offset(offset),

            db
            .select({
                total: count()
            })
            .from(orders)
            .where(and(...queryFilters))
        ])

        return {
            paginationInfo: {
                totalBooksCount: orderCount.total,
                totalPages: Math.ceil(orderCount.total/limit),
                page: page,
                limit: limit
            },
            salesOrders
        }
    },

    async viewOrderDetails(userId: number, orderId: number) {
        const [existingOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderId, orderId))

        if(!existingOrder) {
            throw new ApiError(404, "Order not found")
        }

        if(userId !== existingOrder.buyerId && userId !== existingOrder.sellerId) {
            throw new ApiError(403, "Access Denied")
        }

        const joinCondition: SQL = userId === existingOrder.buyerId ? eq(users.userId, orders.sellerId) : eq(users.userId, orders.buyerId)

        const [orderDetails] = await db
        .select({
            orderId: orders.orderId,
            orderedAt: orders.orderedAt,
            orderStatus: orders.orderStatus,
            myConfirmation: userId === existingOrder.buyerId ? orders.buyerVerifiedAt : orders.sellerVerifiedAt,
            counterPartyConfirmation: userId === existingOrder.buyerId ? orders.sellerVerifiedAt : orders.buyerVerifiedAt,
            counterParty: {
                userId: users.userId,
                name: users.name,
                userRating: userId === existingOrder.buyerId ? users.avgSellerRating : users.avgBuyerRating,
                phoneNo: users.phoneNo,
                isverified: users.isVerified
            },
            bookInfo: {
                bookId: booksCatalogue.bookId,
                title: booksCatalogue.title,
                imageUrl: booksCatalogue.imageUrl
            },
            price: booksListings.price,
            bookCondition: booksListings.bookCondition
        })
        .from(orders)
        .innerJoin(users, joinCondition)
        .innerJoin(booksListings, eq(booksListings.listingId, orders.listingId))
        .innerJoin(booksCatalogue, eq(booksCatalogue.bookId, booksListings.bookId))
        .where(eq(orders.orderId, orderId))

        return {
            userRole: userId === existingOrder.buyerId ? 'buyer' : 'seller',
            ...orderDetails
        }
    },

    async updateFailedOrders() {
        const gracePeriodCutOff = new Date()
        gracePeriodCutOff.setDate(gracePeriodCutOff.getDate() - GRACE_PERIOD)

        await db.transaction(async (tx) => {
            // get the failed orders
            const failedOrders = await tx
            .select()
            .from(orders)
            .where(and(
                eq(orders.orderStatus, 'pending'),
                lt(orders.orderedAt, gracePeriodCutOff)
            ))

            if(failedOrders.length > 0) {
                const failedOrdersIds = failedOrders.map((order) => order.orderId )
                const listingIds = failedOrders.map((order) => order.listingId)

                await tx
                .update(orders)
                .set({
                    orderStatus: 'failed'
                })
                .where(inArray(orders.orderId, failedOrdersIds))

                await tx
                .update(booksListings)
                .set({
                    listingStatus: 'available'
                })
                .where(inArray(booksListings.listingId, listingIds))
            } 
        })
    }
}