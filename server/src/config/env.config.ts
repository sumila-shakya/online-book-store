declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string,
            CLIENT_URL: string,
            DB_HOST: string,
            DB_USER: string,
            DB_PASSWORD: string,
            DB_NAME: string,
            ACCESS_TOKEN_SECRET: string,
            REFRESH_TOKEN_SECRET: string,
            GOOGLE_CLIENT_ID: string
            GOOGLE_CLIENT_SECRET: string,
            GOOGLE_REDIRECT_URI: string,
            GOOGLE_BOOKS_API_KEY: string
        }
    }
}

export {}