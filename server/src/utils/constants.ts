export const DEFAULT_PAGE_LIMIT = 5
export const AUTH_PROVIDER = ['local', 'google'] as const
export const BOOKS_SOURCE = ['manual', 'google'] as const
export const LISTING_STATUS = ['available', 'reserved', 'sold'] as const
export const ORDER_STATUS = ['pending', 'product_received', 'successful', 'cancelled', 'failed'] as const
export const BOOK_CONDITION = ['like_new', 'very_good', 'good', 'fair', 'poor'] as const
export const METHODS = ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'] 
export const ALLOWED_HEADERS = ['Content-Type', 'Authorization']
export const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/svg+xml'
] as const
export const COOKIES_OPTIONS = {
    httpOnly: true,
    maxAge: 7*24*60*60*1000,
    sameSite: "lax" as const
} as const
export const CORS_OPTIONS = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: METHODS,
    allowedHeaders: ALLOWED_HEADERS
} as const