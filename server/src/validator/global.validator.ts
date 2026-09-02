import { z } from 'zod'
import { MAX_PAGE_LIMIT } from '../utils/constants'

export const paginationSchema = z.object({
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().max(MAX_PAGE_LIMIT).optional(),
})

/* --------------------------------- VALIDATION TYPES --------------------------------- */
export type paginationType = z.infer<typeof paginationSchema>