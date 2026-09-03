import { z } from 'zod'
import { BOOK_CONDITION, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../utils/constants'

export const bookListingByIsbnSchema = z.object({
    isbn: z.string()
    .min(10, {message: "isbn number too short"})
    .max(20, {message: "isbn number too long"}),
    price: z.coerce.number().min(0, {message: "price cannot be negative"}),
    bookCondition: z.enum(BOOK_CONDITION, {message: "Invalid Condition"}),
})

export const bookListingManuallySchema = z.object({
    title: z.string().min(2,{message: "The title must be at least two characters long"}).trim(),
    price: z.coerce.number().min(0, {message: "price cannot be negative"}),
    bookCondition: z.enum(BOOK_CONDITION, {message: "Invalid Condition"}),
    description: z.string().optional(),
    authors: z.string().min(2,{message: "The author name is too short"}).optional()
})

export const bookFilterSchema = z.object({
    q: z.string().optional(),
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().max(MAX_PAGE_LIMIT).optional(),
})

/* --------------------------------- VALIDATION TYPES --------------------------------- */
export type bookListingByIsbnType = z.infer<typeof bookListingByIsbnSchema>
export type bookListingManuallyType = z.infer<typeof bookListingManuallySchema>
export type bookFilterType = z.infer<typeof bookFilterSchema>