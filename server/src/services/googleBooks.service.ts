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
        return data.items
    },

    async searchForBooks(queryString: string) {
        const response = await googleBooksClient.get('/volumes', {
            params: {
                q: queryString,
                key: process.env.GOOGLE_BOOKS_API_KEY
            }
        })

        const data: googleBookSearchResponseType = googleBooksSearchResponseSchema.parse(response.data)
        console.log(data)
        return data
    },

    async getBooksByISBNs(isbns: string[]) {
        const requests = isbns.map((isbn) => {
            return googleBooksClient.get('/volumes', {
                params: {
                    q: `isbn:${isbn}`,
                    maxResults: 1,
                    key: process.env.GOOGLE_BOOKS_API_KEY
                }
            })
        })

        const responses = await Promise.allSettled(requests)
        const bookDatas = responses.map((response) => {
            if(response.status == 'fulfilled') {
                const data:googleBookSearchResponseType = googleBooksSearchResponseSchema.parse(response.value.data)
                if(data.items.length > 0) {
                    const bookData = data.items[0]
                    return bookData
                }
            }
        }).filter((bookData) => bookData !== undefined)

        console.log(bookDatas)

        return bookDatas
    },
}
