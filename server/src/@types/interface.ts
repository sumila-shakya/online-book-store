import { bookListingManuallyType } from "../validator/books.validator"

export interface Payload {
    userId: number,
    isVerified: boolean
}

export interface ManualBookUpload extends bookListingManuallyType {
    localFilePath?: string
}

export interface BookInformation {
    title: string,
    isbn?: string,
    description?: string,
    authors?: string,
    imageUrl?: string,
    subtitle?: string,
    publisher?: string,
    publishedDate?: string,
    pageCount?: number,
    categories?: string[],
    language?: string
}