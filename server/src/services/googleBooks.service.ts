import axios from "axios";
import { googleBooksSearchResponseSchema, googleBookSearchResponseType } from "../validator/volumes.validator";

const googleBooksClient = axios.create({
    baseURL: 'https://www.googleapis.com/books/v1'
})

export const googleBookServices = {
    async getBooksByISBN(isbn: string) {
        
        const response = await googleBooksClient.get('/volumes', {
            params: {
                q: `isbn:${isbn}`,
                key: process.env.GOOGLE_BOOKS_API_KEY
            }
        })
        const data: googleBookSearchResponseType = googleBooksSearchResponseSchema.parse(response.data)

        if(data.items.length === 0) {
            if(isbn.length === 13) {
                const isbn10 = isbn.slice(3)
                const response = await googleBooksClient.get('/volumes', {
                    params: {
                        q: `isbn:${isbn10}`,
                        key: process.env.GOOGLE_BOOKS_API_KEY
                    }
                })
                const data: googleBookSearchResponseType = googleBooksSearchResponseSchema.parse(response.data)
                if(data.items.length > 0) return data.items
            }
            const response = await googleBooksClient.get('/volumes', {
                params: {
                    q: isbn,
                    key: process.env.GOOGLE_BOOKS_API_KEY
                }
            })
            const data: googleBookSearchResponseType = googleBooksSearchResponseSchema.parse(response.data)
            if(data.items.length > 0) return data.items
        }

        console.log(data)
        return data.items
    }
}
