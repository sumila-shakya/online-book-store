import { db } from "../config/mysql.config";
import { booksListings, booksCatalogue, users, NewBook, NewListing } from "../models/mysql.model";
import { eq, count, and, inArray } from "drizzle-orm";
import { ApiError } from "../utils/apiError"
import { bookListingType, bookFilterType } from "../validator/books.validator";
import { googleBookServices } from "./googleBooks.service";
import { googleBookVolumeType, volumeInfoType } from "../validator/volumes.validator";
import { DEFAULT_PAGE_LIMIT } from "../utils/constants";


export const bookServices = {
    async listBookByIsbn(userId: number, data: bookListingType) {
        //check if the book exists and isbn number is not a jargon
        const items: googleBookVolumeType[] = await googleBookServices.getBooksByISBN(data.isbn)
        
        if(items.length <= 0) {
            throw new ApiError(400, "Invalid isbn number")
        }

        const bookVolume: volumeInfoType = items[0].volumeInfo
        const imageUrl = bookVolume.imageLinks?.thumbnail ??
                        bookVolume.imageLinks?.smallThumbnail ??
                        bookVolume.imageLinks?.small ?? null

        const newBook: NewBook = {
            title: bookVolume.title,
            bookSource:'google',
            isbn: data.isbn,
            ...(bookVolume.description && {description:bookVolume.description}),
            ...(bookVolume.authors && {authors: bookVolume.authors.join(";")}),
            ...(imageUrl && {imageUrl: imageUrl})
        }

        const [book] = await db
        .insert(booksCatalogue)
        .values(newBook) 

        const newListing: NewListing = {
            sellerId: userId,
            bookId: book.insertId,
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
        /*
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

        const [item]: googleBookVolumeType[] = await googleBookServices.getBooksByISBN(bookListing.isbn)

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
        */
    },

    async viewBooks(filters: bookFilterType) {
        /*
        // get the pagination data
        const page = filters.page || 1
        const limit = filters.limit || DEFAULT_PAGE_LIMIT
        const offset = (page - 1)*limit

        if(filters.q) {
            const result = await googleBookServices.searchForBooks(filters.q)
            const items = result.items || []
            if(items.length == 0 ) {
                throw new ApiError(404,"Book not found")
            }

            const isbns = [...new Set(
                items.flatMap((item) => 
                    (item.volumeInfo?.industryIdentifiers || [])
                    .filter((id) => ['ISBN_10', 'ISBN_13'].includes(id.type))
                    .map((id) => id.identifier)
                )
            )];

            const [listings, [booksCount]] = await Promise.all([
                db
                .select()
                .from(booksListings)
                .where(and(
                    eq(booksListings.listingStatus, 'available'),
                    inArray(booksListings.isbn, isbns)
                ))
                .offset(offset)
                .limit(limit),

                db
                .select({
                    total: count()
                })
                .from(booksListings)
                .where(eq(booksListings.listingStatus, 'available'))
            ])

            if(listings.length <= 0) {
                throw new ApiError(404,"Book not found")
            }

            const itemsViews = result.items.map((item) => {
                const isbns = item.volumeInfo.industryIdentifiers.map((obj) => obj.identifier)
                return {
                    title: item.volumeInfo.title,
                    isbns: isbns,
                    imageLinks: item.volumeInfo.imageLinks
                }
            })
            const books = listings.map((listing) => {
                const itemView = itemsViews.filter((obj) => {
                    if(obj.isbns.includes(listing.isbn)) {
                        return true
                    }
                    else {
                        return false
                    }
                })

                return {
                    listingId: listing.listingId,
                    bookTitle: itemView.length > 0 ? itemView[0].title : undefined,
                    sellerId: listing.sellerId,
                    price: listing.price,
                    listingStatus: listing.listingStatus,
                    bookCondition: listing.bookCondition,
                    imageLinks: itemView.length > 0 ? itemView[0].imageLinks: undefined
                }
            })

            return {
                paginationInfo: {
                    totalBooksCount: booksCount.total,
                    totalPages: Math.ceil(booksCount.total/limit),
                    page: page,
                    limit: limit
                },
                books
            }
        }

        const [listings, [booksCount]] = await Promise.all([
            db
            .select()
            .from(booksListings)
            .where(eq(booksListings.listingStatus, 'available'))
            .offset(offset)
            .limit(limit),

            db
            .select({
                total: count()
            })
            .from(booksListings)
            .where(eq(booksListings.listingStatus, 'available'))
        ])

        const bookIsbns = listings.map((listing) => listing.isbn)
        const items: googleBookVolumeType[] = await googleBookServices.getBooksByISBNs(bookIsbns)
        const itemsViews = items.map((item) => {
            const isbns = item.volumeInfo.industryIdentifiers.map((obj) => obj.identifier)
            return {
                title: item.volumeInfo.title,
                isbns: isbns,
                imageLinks: item.volumeInfo.imageLinks
            }
        })
        const books = listings.map((listing) => {
            const itemView = itemsViews.filter((obj) => {
                if(obj.isbns.includes(listing.isbn)) {
                    return true
                }
                else {
                    return false
                }
            })

            return {
                listingId: listing.listingId,
                bookTitle: itemView.length > 0 ? itemView[0].title : undefined,
                sellerId: listing.sellerId,
                price: listing.price,
                listingStatus: listing.listingStatus,
                bookCondition: listing.bookCondition,
                imageLinks: itemView.length > 0 ? itemView[0].imageLinks: undefined
            }
        })

        return {
            paginationInfo: {
                totalBooksCount: booksCount.total,
                totalPages: Math.ceil(booksCount.total/limit),
                page: page,
                limit: limit
            },
            books
        }
    */
    }
}