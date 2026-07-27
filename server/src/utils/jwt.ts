import jwt from 'jsonwebtoken'
import { ApiError } from './apiError'
import { Payload } from '../@types/interface'
import { payloadSchema } from './validator'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!

export const jwtUtils = {
    generateAccessToken(payload: Payload): string {
        if(!ACCESS_TOKEN_SECRET) {
            console.error("Access token not defined!")
        }
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
    },

    verifyAccessToken(accessToken: string): Payload {
        try {
            const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET)
            const user: Payload = payloadSchema.parse(decoded)
            return user
        } catch(error) {
            if(error instanceof jwt.TokenExpiredError) {
                throw new ApiError(401, "Token expired!!")
            }
            throw new ApiError(401, "Invalid token!!")
        }
    },
}