import { db } from "../config/mysql.config";
import { booksListings, booksCatalogue, users, NewBook, NewListing, Listing } from "../models/mysql.model";
import { eq, count, and, sql, desc, asc, inArray } from "drizzle-orm";
import { ApiError } from "../utils/apiError"
import { bookListingByIsbnType, bookFilterType } from "../validator/books.validator";
import { googleBookServices } from "./googleBooks.service";
import { googleBookVolumeType, volumeInfoType } from "../validator/volumes.validator";
import { DEFAULT_PAGE_LIMIT } from "../utils/constants";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ManualBookUpload, BookInformation, PaginationMetaData } from "../@types/interface";
import { parseISBN } from "../utils/parser";

export const bookServices = {
    async listBookByIsbn(userId: number, data: bookListingByIsbnType) {
        //check if the book exists and isbn number is not a jargon
        const cleanedISBN = data.isbn.trim().replace(/[-\s]/g,"")

        if(!parseISBN(cleanedISBN)) {
            throw new ApiError(400, "Invalid ISBN")
        }

        const [existingBook] = await db
        .select()
        .from(booksCatalogue)
        .where(eq(booksCatalogue.isbn, cleanedISBN))

        let bookId: number

        if(existingBook) {
            bookId = existingBook.bookId
        } 
        else {
            const items: googleBookVolumeType[] = await googleBookServices.getBooksByISBN(cleanedISBN)
        
            if(items.length <= 0) {
                throw new ApiError(500, "Sorry, book can't be found!!")
            }

            const bookVolume: volumeInfoType = items[0].volumeInfo
            const imageUrl = bookVolume.imageLinks?.thumbnail ??
                        bookVolume.imageLinks?.smallThumbnail ??
                        bookVolume.imageLinks?.small ?? null

            const newBook: NewBook = {
                title: bookVolume.title,
                bookSource:'google',
                isbn: cleanedISBN, // can be either isbn 10 or isbn 13
                ...(bookVolume.description && {description:bookVolume.description}),
                ...(bookVolume.authors && {authors: bookVolume.authors.join(";")}),
                ...(imageUrl && {imageUrl: imageUrl})
            }

            const [book] = await db
            .insert(booksCatalogue)
            .values(newBook)
            
            bookId = book.insertId
        }

        const newListing: NewListing = {
            sellerId: userId,
            bookId: bookId,
            bookCondition: data.bookCondition,
            price: data.price
        }

        const [result] = await db
        .insert(booksListings)
        .values(newListing)

        const [userListing]: Listing[] = await db
        .select()
        .from(booksListings)
        .where(eq(booksListings.listingId, result.insertId))

        return userListing
    },

    async listBookManually(userId: number, data: ManualBookUpload) {
        const newBook: NewBook = {
            title: data.title,
            bookSource: 'manual',
            ...(data.description && {description:data.description}),
            ...(data.authors && {authors: data.authors})
        }

        if(data.localFilePath) {
            const uploadedResult = await uploadOnCloudinary(data.localFilePath)
            
            // throw error for failed cloudinary file upload
            if(!uploadedResult) {
                throw new ApiError(500, "File upload failed")
            }

            newBook.imageUrl = uploadedResult.secure_url
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

        const [userListing]: Listing[] = await db
        .select()
        .from(booksListings)
        .where(eq(booksListings.listingId, result.insertId))

        return userListing
    },

    async getlistedBookById(listingId: number) {
        const [bookListing] = await db
        .select({
            listingId: booksListings.listingId,
            sellerId: booksListings.sellerId,
            sellerName: users.name,
            sellerRating: users.avgSellerRating,
            phoneNo: users.phoneNo,
            isVerified: users.isVerified,
            bookId:booksListings.bookId,
            title: booksCatalogue.title,
            isbn: booksCatalogue.isbn,
            description: booksCatalogue.description,
            authors: booksCatalogue.authors,
            imageUrl: booksCatalogue.imageUrl,
            bookSource: booksCatalogue.bookSource,
            price: booksListings.price,
            bookCondition: booksListings.bookCondition,
            listingStatus: booksListings.listingStatus,
            listedAt: booksListings.listedAt
        })
        .from(booksListings)
        .innerJoin(users, eq(users.userId, booksListings.sellerId))
        .innerJoin(booksCatalogue, eq(booksCatalogue.bookId, booksListings.bookId))
        .where(eq(booksListings.listingId, listingId))

        if(!bookListing) {
            throw new ApiError(404, "Not Found")
        }

        const bookInfo: BookInformation = {
            title: bookListing.title,
            ...(bookListing.isbn && {isbn: bookListing.isbn}),
            ...(bookListing.description && {description:bookListing.description}),
            ...(bookListing.authors && {authors: bookListing.authors}),
            ...(bookListing.imageUrl && {imageUrl: bookListing.imageUrl})
        }

        if(bookListing.bookSource === 'google' && bookListing.isbn) {
            const items: googleBookVolumeType[] = await googleBookServices.getBooksByISBN(bookListing.isbn)
            const googleBook = items?.[0];

            if (googleBook?.volumeInfo) {
                const { volumeInfo } = googleBook;
                if(volumeInfo.subtitle) bookInfo.subtitle = volumeInfo.subtitle
                if(volumeInfo.publisher) bookInfo.publisher = volumeInfo.publisher
                if(volumeInfo.publishedDate) bookInfo.publishedDate = volumeInfo.publishedDate
                if(volumeInfo.pageCount) bookInfo.pageCount = volumeInfo.pageCount
                if(volumeInfo.language) bookInfo.language = volumeInfo.language
                if(volumeInfo.categories && volumeInfo.categories.length > 0) bookInfo.categories = volumeInfo.categories
            }
        }


        return {
            listingId: bookListing.listingId,
            sellerInfo:{
                sellerId: bookListing.sellerId,
                sellerName: bookListing.sellerName,
                sellerRating: bookListing.sellerRating,
                phoneNo: bookListing.phoneNo,
                isVerified: bookListing.isVerified
            },
            bookInfo: bookInfo,
            price: bookListing.price,
            bookCondition: bookListing.bookCondition,
            listingStatus: bookListing.listingStatus,
            listedAt: bookListing.listedAt
        }
        
    },

    async viewBooks(filters: bookFilterType) {
        // get the pagination data
        const page = filters.page || 1
        const limit = filters.limit || DEFAULT_PAGE_LIMIT
        const offset = (page - 1)*limit
        
        const queryFilters = [inArray(booksListings.listingStatus, ['available', 'reserved'])]

        if(filters.q) {
            if(parseISBN(filters.q.trim())) {
                const cleanedISBN = filters.q.trim().replace(/[-\s]/g,"")
                queryFilters.push(eq(booksCatalogue.isbn, cleanedISBN))
            }
            else{
                const searchTerm = `%${filters.q.trim()}%`
                queryFilters.push(sql`
                    (${booksCatalogue.title} LIKE ${searchTerm} OR ${booksCatalogue.authors} LIKE ${searchTerm} OR ${booksCatalogue.description} LIKE ${searchTerm})
                `)
            }
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
                listedAt: booksListings.listedAt,
                listingStatus: booksListings.listingStatus,
            })
            .from(booksListings)
            .innerJoin(users, eq(users.userId, booksListings.sellerId))
            .innerJoin(booksCatalogue, eq(booksCatalogue.bookId, booksListings.bookId))
            .where(and(...queryFilters))
            .orderBy(desc(booksListings.listedAt), asc(booksListings.listingId))
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

        const paginationInfo: PaginationMetaData  = {
            totalBooksCount: booksCount.total,
            totalPages: Math.ceil(booksCount.total/limit),
            page: page,
            limit: limit
        }

        return {
            paginationInfo,
            listings
        }
    }
}