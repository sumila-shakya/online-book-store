import { Request, Response, NextFunction } from "express"
import { ApiError } from "../utils/apiError"

//wrapper function
export const requirePhoneVerified = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const isVerified = req.user?.isVerified

        if(!isVerified) {
            return next(new ApiError(403,"Please verify your phone number to continue"))
        }
        
        next()
    }
}