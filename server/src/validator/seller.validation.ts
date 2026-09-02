import { z } from 'zod'
import { MAX_PAGE_LIMIT, LISTING_STATUS } from '../utils/constants'

export const sellerListingFilterSchema = z.object({
    listingStatus: z.enum(LISTING_STATUS, {message: "Invalid status"}).optional(),
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().max(MAX_PAGE_LIMIT).optional(),
})

/* --------------------------------- VALIDATION TYPES --------------------------------- */
export type sellerListingFilterType = z.infer<typeof sellerListingFilterSchema>