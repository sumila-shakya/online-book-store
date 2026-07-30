import axios from "axios";
import { googleBooksSearchResponseSchema, googleBookSearchResponseType } from "../validator/volumes.validator";

const googleBooksClient = axios.create({
    baseURL: 'https://www.googleapis.com/books/v1'
})

export const getBooksByISBN = async(isbn: string) => {
    const response = await googleBooksClient.get('/volumes', {
        params: {
            q: `isbn:${isbn}`,
            key: process.env.GOOGLE_BOOKS_API_KEY
        }
    })

    const data: googleBookSearchResponseType = googleBooksSearchResponseSchema.parse(response.data)

    console.log(data.items)

    return  data.items
}