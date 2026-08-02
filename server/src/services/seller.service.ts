import { db } from "../config/mysql.config";
import { users, booksCatalogue, booksListings } from "../models/mysql.model";
import { eq, count, and, sql } from "drizzle-orm";
import { ApiError } from "../utils/apiError";
import { sellerListingFilterType } from "../validator/seller.validation";
import { paginationType } from "../validator/global.validator";
import { DEFAULT_PAGE_LIMIT, LISTING_STATUS } from "../utils/constants";

export const sellerServices = {
    async viewMyListings(userId: number, data: sellerListingFilterType) {
        // get the pagination data
        const page = data.page || 1
        const limit = data.limit || DEFAULT_PAGE_LIMIT
        const offset = (page - 1)*limit
                
        const queryFilters = [eq(booksListings.sellerId, userId)]
        if(data.listingStatus) {
            queryFilters.push(eq(booksListings.listingStatus, data.listingStatus))
        }

        const [[sellerInfo], [summary], listings, [listingCount]] = await Promise.all([
            db
            .select({
                sellerId: users.userId,
                sellerName: users.name,
                avgSellerRating: users.avgSellerRating,
                sellerReviewCount: users.sellerReviewCount
            })
            .from(users)
            .where(eq(users.userId, userId))
            ,

            db
            .select({
                totalListings: count(),
                availableBooks: sql<number>`SUM(CASE WHEN ${booksListings.listingStatus} = ${LISTING_STATUS[0]} THEN 1 ELSE 0 END)`.mapWith(Number),
                reservedBooks: sql<number>`SUM(CASE WHEN ${booksListings.listingStatus} = ${LISTING_STATUS[1]} THEN 1 ELSE 0 END)`.mapWith(Number),
                soldBooks: sql<number>`SUM(CASE WHEN ${booksListings.listingStatus} = ${LISTING_STATUS[2]} THEN 1 ELSE 0 END)`.mapWith(Number),
            })
            .from(booksListings)
            .where(eq(booksListings.sellerId, userId)),

            db
            .select({
                listingId: booksListings.listingId,
                bookId:booksListings.bookId,
                title: booksCatalogue.title,
                imageUrl: booksCatalogue.imageUrl,
                price: booksListings.price,
                bookCondition: booksListings.bookCondition,
                listingStatus: booksListings.listingStatus,
                listedAt: booksListings.listedAt,
                updatedAt: booksListings.updatedAt
            })
            .from(booksListings)
            .innerJoin(booksCatalogue, eq(booksCatalogue.bookId, booksListings.bookId))
            .where(and(...queryFilters))
            .offset(offset)
            .limit(limit),
        
            db
            .select({
                total: count()
            })
            .from(booksCatalogue)
            .innerJoin(booksListings, eq(booksListings.bookId, booksCatalogue.bookId))
            .where(and(...queryFilters))
        ])

        return {
            paginationInfo: {
                totalBooksCount: listingCount.total,
                totalPages: Math.ceil(listingCount.total/limit),
                page: page,
                limit: limit
            },
            sellerInfo,
            summary,
            listings
        }
    },

    async viewSellerListing(sellerId: number, paginationData: paginationType) {
        // get the pagination data
        const page = paginationData.page || 1
        const limit = paginationData.limit || DEFAULT_PAGE_LIMIT
        const offset = (page - 1)*limit

        const [existingSeller] = await db
        .select()
        .from(users)
        .where(eq(users.userId, sellerId))

        if(!existingSeller) {
            throw new ApiError(404, "Seller not found")
        }

        const [listings, [booksCount]] = await Promise.all([
            db
            .select({
                listingId: booksListings.listingId,
                sellerId: booksListings.sellerId,
                sellerName: users.name,
                sellerRating: users.avgSellerRating,
                bookId:booksListings.bookId,
                title: booksCatalogue.title,
                imageUrl: booksCatalogue.imageUrl,
                price: booksListings.price,
                bookCondition: booksListings.bookCondition,
                listingStatus: booksListings.listingStatus,
            })
            .from(booksListings)
            .innerJoin(users, eq(users.userId, booksListings.sellerId))
            .innerJoin(booksCatalogue, eq(booksCatalogue.bookId, booksListings.bookId))
            .where(and(
                eq(booksListings.sellerId, sellerId),
                eq(booksListings.listingStatus,  'available')
            ))
            .offset(offset)
            .limit(limit),

            db
            .select({
                total: count()
            })
            .from(booksCatalogue)
            .innerJoin(booksListings, eq(booksListings.bookId, booksCatalogue.bookId))
            .where(and(
                eq(booksListings.sellerId, sellerId),
                eq(booksListings.listingStatus,  'available')
            ))
        ])

        return {
            paginationInfo: {
                totalBooksCount: booksCount.total,
                totalPages: Math.ceil(booksCount.total/limit),
                page: page,
                limit: limit
            },
            listings
        }
    }
}