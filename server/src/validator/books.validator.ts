import { z } from 'zod'
import { BOOK_CONDITION } from '../utils/constants'

export const bookListingSchema = z.object({
    isbn: z.string().max(20, {message: "isbn number too long"}),
    price: z.number().min(0, {message: "price cannot be negative"}),
    bookCondition: z.enum(BOOK_CONDITION, {message: "Invalid Condition"}),
})

export type bookListingType = z.infer<typeof bookListingSchema>