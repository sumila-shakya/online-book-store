import { z } from 'zod'

export const reviewSchema = z.object({
    revieweeId: z.coerce.number().positive(),
    rating: z.coerce.number().positive()
    .min(1, {message: 'rating cannot be less than 1'})
    .max(5, {message: 'rating cannot be greater than 5'})
})

/* --------------------------------- VALIDATION TYPES --------------------------------- */
export type reviewType = z.infer<typeof reviewSchema>