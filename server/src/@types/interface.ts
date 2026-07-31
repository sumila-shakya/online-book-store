import { bookListingManuallyType } from "../validator/books.validator"

export interface Payload {
    userId: number
}

export interface ManualBookUpload extends bookListingManuallyType {
    localFilePath?: string
}