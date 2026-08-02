import { db } from "../config/mysql.config";
import { users, orders, reviews, NewReview } from "../models/mysql.model";
import { ApiError } from "../utils/apiError";
import { eq, and, sql } from "drizzle-orm";
import { reviewType } from "../validator/review.validator";
import { THRESHOLD_FREQUENCY } from "../utils/constants";

export const reviewServices = {
    async reviewSeller(reviewerId: number, orderId: number, data: reviewType) {
        const [[existingOrder], [existingReview]] = await Promise.all([
            db
            .select()
            .from(orders)
            .where(and(
                eq(orders.orderId, orderId),
                eq(orders.buyerId, reviewerId)
            )),

            db
            .select()
            .from(reviews)
            .where(and(
                eq(reviews.orderId, orderId),
                eq(reviews.reviewerId, reviewerId)
            ))
        ])

        if(!existingOrder) {
            throw new ApiError(403, "Access Denied")
        }

        if(existingOrder.sellerId !== data.revieweeId) {
            throw new ApiError(400, "Cannot review other than seller")
        } 

        if(existingReview) {
            throw new ApiError(400, "Already reviewed")
        }

        await db.transaction(async (tx) => {
            const newReview: NewReview = {
                orderId: orderId,
                reviewerId: reviewerId,
                revieweeId: data.revieweeId,
                rating: data.rating
            }

            const [result] = await tx
            .insert(reviews)
            .values(newReview)

            await tx
            .update(users)
            .set({
                sellerReviewCount: sql`${users.sellerReviewCount} + 1`,
                sellerReviewSum: sql`${users.sellerReviewSum} + ${data.rating}`
            })
            .where(eq(users.userId, data.revieweeId))

            const [[targetAvg], [sellerReviewInfo]] = await Promise.all([ 
                tx
                .select({
                    average: sql<number>`AVG(${reviews.rating})`.mapWith(Number)
                })
                .from(reviews),

                tx
                .select({
                    sellerReviewCount: users.sellerReviewCount,
                    sellerReviewSum: users.sellerReviewSum
                })
                .from(users)
                .where(eq(users.userId, data.revieweeId))
            ])

            const confidenceLevel: number = THRESHOLD_FREQUENCY || 10

            const bayesianAvg = (sellerReviewInfo.sellerReviewSum + targetAvg.average * confidenceLevel) / (sellerReviewInfo.sellerReviewCount + confidenceLevel)

            await tx
            .update(users)
            .set({
                avgSellerRating: Number(bayesianAvg.toFixed(2))
            })
        })
    },

    async reviewBuyer(reviewerId: number, orderId: number, data: reviewType) {
        const [[existingOrder], [existingReview]] = await Promise.all([
            db
            .select()
            .from(orders)
            .where(and(
                eq(orders.orderId, orderId),
                eq(orders.sellerId, reviewerId)
            )),

            db
            .select()
            .from(reviews)
            .where(and(
                eq(reviews.orderId, orderId),
                eq(reviews.reviewerId, reviewerId)
            ))
        ])

        if(!existingOrder) {
            throw new ApiError(403, "Access Denied")
        }

        if(existingOrder.buyerId !== data.revieweeId) {
            throw new ApiError(400, "Cannot review other than buyer")
        } 

        if(existingReview) {
            throw new ApiError(400, "Already reviewed")
        }

        await db.transaction(async (tx) => {
            const newReview: NewReview = {
                orderId: orderId,
                reviewerId: reviewerId,
                revieweeId: data.revieweeId,
                rating: data.rating
            }

            const [result] = await tx
            .insert(reviews)
            .values(newReview)

            await tx
            .update(users)
            .set({
                buyerReviewCount: sql`${users.buyerReviewCount} + 1`,
                buyerReviewSum: sql`${users.buyerReviewSum} + ${data.rating}`
            })
            .where(eq(users.userId, data.revieweeId))

            const [[targetAvg], [buyerReviewInfo]] = await Promise.all([ 
                tx
                .select({
                    average: sql<number>`AVG(${reviews.rating})`.mapWith(Number)
                })
                .from(reviews),

                tx
                .select({
                    buyerReviewCount: users.buyerReviewCount,
                    buyerReviewSum: users.buyerReviewSum
                })
                .from(users)
                .where(eq(users.userId, data.revieweeId))
            ])

            const confidenceLevel: number = THRESHOLD_FREQUENCY || 10

            const bayesianAvg = (buyerReviewInfo.buyerReviewSum + targetAvg.average * confidenceLevel) / (buyerReviewInfo.buyerReviewCount + confidenceLevel)

            await tx
            .update(users)
            .set({
                avgBuyerRating: Number(bayesianAvg.toFixed(2))
            })
        })
    }
}