export const AUTH_PROVIDER = ['local', 'google'] as const
export const METHODS = ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'] 
export const ALLOWED_HEADERS = ['Content-Type', 'Authorization']
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