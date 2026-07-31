import { ApiError } from "./apiError"

// parse the id function
export const parseId = (value: string): number => {
    // convert the value string to number
    const id = Number(value)
    
    //check if the id is a actual positive number
    if(isNaN(id) || id <= 0) {
        throw new ApiError(400, "Invalid id")
    }

    return id
}

export const parseISBN = (value: string) => {
    const cleanedISBN = value.replace(/[-\s]/g,"")
    return /^(\d{10}|\d{9}X|\d{13})$/i.test(cleanedISBN)
}