declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string,
            DB_HOST: string,
            DB_USER: string,
            DB_PASSWORD: string,
            DB_NAME: string,
            ACCESS_TOKEN_SECRET: string,
        }
    }
}

export {}