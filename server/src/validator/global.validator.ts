import { z } from 'zod'
import { DEFAULT_PAGE_LIMIT } from '../utils/constants'

export const paginationSchema = z.object({
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().max(DEFAULT_PAGE_LIMIT).optional(),
})

export type paginationType = z.infer<typeof paginationSchema>