import { z } from 'zod'
import { ORDER_STATUS, DEFAULT_PAGE_LIMIT } from '../utils/constants'

export const orderFilterSchema = z.object({
    orderStatus: z.enum(ORDER_STATUS, {message: "Invalid Status"}).optional(),
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().max(DEFAULT_PAGE_LIMIT).optional(),
})

/* --------------------------------- VALIDATION TYPES --------------------------------- */
export type orderFilterType = z.infer<typeof orderFilterSchema>