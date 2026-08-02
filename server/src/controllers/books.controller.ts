import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { bookServices } from "../services/books.service";
import { bookListingByIsbnSchema, bookListingManuallySchema, bookFilterSchema, bookListingByIsbnType, bookListingManuallyType, bookFilterType } from "../validator/books.validator";
import { parseId } from "../utils/parser";
import { ManualBookUpload } from "../@types/interface";
import fs from 'fs'

export const bookController = {
    async listBookByIsbn(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            // get the data from the req.body
            const data: bookListingByIsbnType = bookListingByIsbnSchema.parse(req.body)

            // get the result
            const result = await bookServices.listBookByIsbn(userId, data)

            // send 201 success msg
            res
            .status(201)
            .json(new ApiResponse(201, result, "Book listed successfully"))
        } catch(error) {
            next(error)
        }
    },

    async listBookManually(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            const validatedData: bookListingManuallyType = bookListingManuallySchema.parse(req.body)
            const data: ManualBookUpload = {...validatedData}

            if(req.file) {
                data.localFilePath = req.file.path
            }

            const result = await bookServices.listBookManually(userId, data)

            res
            .status(201)
            .json(new ApiResponse(201, result, "Book listed successfully"))            
        } catch(error) {
            if(req.file) fs.unlinkSync(req.file.path)
            next(error)
        }
    },

    async getListedBookById(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            // parse the task id
            const listingId = parseId(req.params.listingId as string)

            const result = await bookServices.getlistedBookById(listingId)

            res
            .status(200)
            .json(new ApiResponse(200, result))
        } catch(error) {
            next(error)
        }
    },

    async viewBooks(req: Request, res: Response, next: NextFunction) {
        try {
            const filters: bookFilterType = bookFilterSchema.parse(req.query)

            const books = await bookServices.viewBooks(filters)

            res
            .status(200)
            .json(new ApiResponse(200, books))
        } catch(error) {
            next(error)
        }
    }
}