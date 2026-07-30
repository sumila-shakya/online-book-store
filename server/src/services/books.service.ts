import { db } from "../config/mysql.config";
import { booksListings, users, Listing, NewListing } from "../models/mysql.model";
import { eq } from "drizzle-orm";
import { ApiError } from "../utils/apiError"
import { bookListingType } from "../validator/books.validator";
import { getBooksByISBN } from "./googleBooks.service";
import { googleBookVolumeType } from "../validator/volumes.validator";


export const bookServices = {
    async listBook(userId: number, data: bookListingType) {
        //check if the book exists and isbn number is not a jargon
        const items: googleBookVolumeType[] = await getBooksByISBN(data.isbn)
        
        if(items.length <= 0) {
            throw new ApiError(400, "Invalid isbn number")
        }

        const newListing: NewListing = {
            sellerId: userId,
            isbn: data.isbn,
            bookCondition: data.bookCondition,
            price: data.price
        }

        const [result] = await db
        .insert(booksListings)
        .values(newListing)

        const [userListing] = await db
        .select()
        .from(booksListings)
        .where(eq(booksListings.listingId, result.insertId))

        return userListing
    },

    async getlistedBookById(listingId: number) {
        const [bookListing] = await db
        .select({
            listingId: booksListings.listingId,
            isbn: booksListings.isbn,
            sellerId: booksListings.sellerId,
            sellerName: users.name,
            price: booksListings.price,
            bookCondition: booksListings.bookCondition,
            listingStatus: booksListings.listingStatus,
            listedAt: booksListings.listedAt
        })
        .from(booksListings)
        .innerJoin(users, eq(users.userId, booksListings.sellerId))
        .where(eq(booksListings.listingId, listingId))

        if(!bookListing) {
            throw new ApiError(404, "Not Found")
        }

        const [item]: googleBookVolumeType[] = await getBooksByISBN(bookListing.isbn)

        return {
            listingId: bookListing.listingId,
            sellerInfo:{
                sellerId: bookListing.sellerId,
                sellerName: bookListing.sellerName
            },
            bookInfo: item.volumeInfo,
            price: bookListing.price,
            bookCondition: bookListing.bookCondition,
            listingStatus: bookListing.listingStatus,
            listedAt: bookListing.listedAt
        }
    }
}