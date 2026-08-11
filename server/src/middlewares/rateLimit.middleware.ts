import { Request, Response, NextFunction } from "express"
import { ApiError } from "../utils/apiError"
import { RedisClient } from "../config/redis.config"
import { MAX_SERVICE_LIMIT, SERVICE_WINDOW_FRAME, MAX_REQUEST_LIMIT, AUTH_WINDOW_FRAME } from "../utils/constants"
import { requestVerificationSchema, requestVerificationType } from "../validator/auth.validator"

const lua =  `
        local current = redis.call('INCR', KEYS[1])
        if current == 1 then
            redis.call('EXPIRE', KEYS[1], ARGV[1])
        end
        return current
    `

export const rateLimiter = {
    async listingLimiter(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            const key = `listing_count:${userId}`

            const result = await RedisClient.eval(
                lua,
                1,
                key,
                SERVICE_WINDOW_FRAME
            ) as number

            if(result > MAX_SERVICE_LIMIT) {
                throw new ApiError(429, "Too many requests. Please try again later!!")
            }

            next()
        } catch(error) {
            next(error)
        }
    },

    async orderLimiter(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            const key = `order_count:${userId}`
            const result = await RedisClient.eval(
                lua,
                1,
                key,
                SERVICE_WINDOW_FRAME
            ) as number

            if(result > MAX_SERVICE_LIMIT) {
                throw new ApiError(429, "Too many requests. Please try again later!!")
            }

            next()
        } catch(error) {
            next(error)
        }
    },

    async verificationLimiter(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId
            
            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }
            
            const data: requestVerificationType = requestVerificationSchema.parse(req.body)

            const idKey = `verification:userId:${userId}`
            const phoneNoKey = `verification:phoneNo:${data.phoneNo}`

            const phoneNoLimit = await RedisClient.eval(
                lua,
                1,
                idKey,
                AUTH_WINDOW_FRAME
            ) as number

            const idLimit = await RedisClient.eval(
                lua,
                1,
                phoneNoKey,
                AUTH_WINDOW_FRAME
            ) as number

            if(phoneNoLimit > MAX_REQUEST_LIMIT || idLimit > MAX_REQUEST_LIMIT) {
                throw new ApiError(429, "Too many requests. Please try again later!!")
            }
            next()
        } catch(error) {
            next(error)
        }
    }
}