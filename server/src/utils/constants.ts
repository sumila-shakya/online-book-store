export const AUTH_PROVIDER = ['local', 'google'] as const
export const COOKIES_OPTIONS = {
    httpOnly: true,
    maxAge: 7*24*60*60*1000,
    sameSite: "strict" as const
} as const