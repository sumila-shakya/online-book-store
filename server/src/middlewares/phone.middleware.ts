import { Request, Response, NextFunction } from "express"
import { ApiError } from "../utils/apiError"

//wrapper function
export const requirePhoneVerified = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const isVerified = req.user?.isVerified

        if(!isVerified) {
            throw new ApiError(403,"Please verify your phone number to continue")
        }
        
        next()
    } catch(error) {
        next(error)
    }
    
}