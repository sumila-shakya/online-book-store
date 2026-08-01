import { db } from "../config/mysql.config";
import { users, booksCatalogue, booksListings } from "../models/mysql.model";
import { eq, count, and, sql } from "drizzle-orm";
import { ApiError } from "../utils/apiError";
import { sellerListingFilterType } from "../validator/seller.validation";
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

        const [summary, listings, [listingCount]] = await Promise.all([
            db
            .select({
                totalListings: count(),
                availableBooks: sql<number>`SUM(CASE WHEN ${booksListings.listingStatus} = ${LISTING_STATUS[0]} THEN 1 ELSE 0 END)`.mapWith(Number),
                soldBooks: sql<number>`SUM(CASE WHEN ${booksListings.listingStatus} = ${LISTING_STATUS[1]} THEN 1 ELSE 0 END)`.mapWith(Number),
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
            summary,
            listings
        }
    },

    async viewSellerListing(sellerId: number) {

    }
}