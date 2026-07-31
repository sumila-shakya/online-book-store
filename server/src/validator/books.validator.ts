import { z } from 'zod'
import { BOOK_CONDITION, DEFAULT_PAGE_LIMIT } from '../utils/constants'

export const bookListingSchema = z.object({
    isbn: z.string().max(20, {message: "isbn number too long"}),
    price: z.number().min(0, {message: "price cannot be negative"}),
    bookCondition: z.enum(BOOK_CONDITION, {message: "Invalid Condition"}),
})

export const bookFilterSchema = z.object({
    q: z.string().optional(),
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().max(DEFAULT_PAGE_LIMIT).optional(),
})

export type bookListingType = z.infer<typeof bookListingSchema>
export type bookFilterType = z.infer<typeof bookFilterSchema>