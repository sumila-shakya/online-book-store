import { db } from "../config/mysql.config";
import { users, refreshTokens, otps, User, NewUser, NewToken, NewOTP } from "../models/mysql.model";
import { eq, and } from "drizzle-orm";
import { ApiError } from "../utils/apiError";
import { registrationType, loginType, requestVerificationType, verifyPhoneNoType } from "../validator/auth.validator";
import { jwtUtils } from "../utils/jwt";
import { Payload } from "../@types/interface";
import { verifyWithGoogle } from "./googleAuth.service";
import { generateOTP, hashOTP, sendOtp } from "../utils/otp";
import bcrypt from 'bcrypt'

export const authServices = {
    async registerUser(data: registrationType) {
        // check for the existing user
        const existingUser: User[] = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))

        // throw error if the user already exists
        if(existingUser.length > 0) {
            throw new ApiError(409, "User already exists")
        }

        // hash the password for safety
        const hashedPassword: string = await bcrypt.hash(data.password, 10)

        const newUser: NewUser = {
            email: data.email,
            name: data.name,
            password: hashedPassword
        }

        // insert the new user into the database
        const [result] = await db
        .insert(users)
        .values(newUser)

        const payload: Payload = {
            userId: result.insertId,
            isVerified: false
        }

        // generate the new access and refresh tokens
        const accessToken: string = jwtUtils.generateAccessToken(payload)
        const refreshToken: string = jwtUtils.generateRefreshToken(payload)
        const expiryDate: Date = jwtUtils.getExpiryDate()

        // delete the old token
        await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, result.insertId))

        const newToken: NewToken = {
            userId: result.insertId,
            token: refreshToken,
            expiresAt: expiryDate
        }

        // insert the new token
        await db
        .insert(refreshTokens)
        .values(newToken)

        return {
            userId: result.insertId,
            email: data.email,
            name: data.name,
            accessToken: accessToken,
            refreshToken: refreshToken
        }

    },

    async loginUser(data: loginType) {
        // check for the existing user
        const [existingUser]: User[] = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))

        // if the user doesn't exists throw error
        if(!existingUser) {
            throw new ApiError(401, "Invalid credentials")
        }

        // if the user has account using google throw error
        if(!existingUser.password && existingUser.authProvider == 'google') {
            throw new ApiError(400, "Please sign in using the google account")
        }

        // compare the password
        const isValidPassword = await bcrypt.compare(data.password, existingUser.password!)

        // if the password doesn't match throw error
        if(!isValidPassword) {
            throw new ApiError(401, "Invalid credentials")
        }

        const payload: Payload = {
            userId: existingUser.userId,
            isVerified: existingUser.isVerified
        }

        // generate the new access and refresh tokens
        const accessToken: string = jwtUtils.generateAccessToken(payload)
        const refreshToken: string = jwtUtils.generateRefreshToken(payload)
        const expiryDate: Date = jwtUtils.getExpiryDate()

        // delete the old token
        await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, existingUser.userId))

        const newToken: NewToken = {
            userId: existingUser.userId,
            token: refreshToken,
            expiresAt: expiryDate
        }

        // insert the new token
        await db
        .insert(refreshTokens)
        .values(newToken)

        return {
            userId: existingUser.userId,
            email: existingUser.email,
            name: existingUser.name,
            accessToken,
            refreshToken
        }
    },

    async logout(userId: number) {
        // delete the refresh token from the database
        await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, userId))
    },

    async refreshToken(token: string, userId: number) {
        //check for the existing token record
        const [[tokenRecord], [existingUser]] = await Promise.all([
            db
            .select()
            .from(refreshTokens)
            .where(and(
                eq(refreshTokens.userId, userId),
                eq(refreshTokens.token, token)
            )),

            db
            .select()
            .from(users)
            .where(eq(users.userId, userId))
        ])
        // throw error if token record doesn't exists
        if(!tokenRecord) {
            throw new ApiError(401, "Access Denied")
        }

        // throw error if token expired
        if(tokenRecord.expiresAt < new Date()) {
            // delete the expired token
            await db
            .delete(refreshTokens)
            .where(eq(refreshTokens.tokenId, tokenRecord.tokenId))

            throw new ApiError(401, "Token expired! Please login again")
        }

        const payload: Payload = {
            userId: userId,
            isVerified: existingUser.isVerified
        }

        // generate the new access and refresh tokens
        const accessToken: string = jwtUtils.generateAccessToken(payload)
        const refreshToken: string = jwtUtils.generateRefreshToken(payload)
        const expiryDate: Date = jwtUtils.getExpiryDate()

        // delete the old token (token rotation)
        await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.tokenId, tokenRecord.tokenId))

        const newToken: NewToken = {
            userId: userId,
            token: refreshToken,
            expiresAt: expiryDate
        }

        // insert the new token
        await db
        .insert(refreshTokens)
        .values(newToken)
        
        // return new refresh token and access token
        return {
            accessToken,
            refreshToken
        }
    },

    async signInWithGoogle(credential: string) {
        const data = await verifyWithGoogle(credential)
        let userId: number

        const [existingUser] = await db
        .select()
        .from(users)
        .where(and(
            eq(users.email, data.email),
            eq(users.authProvider, 'google')
        ))

        if(!existingUser) {
            const newUser: NewUser = {
                email: data.email,
                name: data.name,
                googleId: data.googleId,
                authProvider: 'google'
            }

            // insert the new user into the database
            const [result] = await db
            .insert(users)
            .values(newUser)

            userId = result.insertId

        }

        userId = existingUser.userId

        const payload: Payload = {
            userId: userId,
            isVerified: existingUser ? existingUser.isVerified : false
        }

        // generate the new access and refresh tokens
        const accessToken: string = jwtUtils.generateAccessToken(payload)
        const refreshToken: string = jwtUtils.generateRefreshToken(payload)
        const expiryDate: Date = jwtUtils.getExpiryDate()

        // delete the old token
        await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, existingUser.userId))

        const newToken: NewToken = {
            userId: existingUser.userId,
            token: refreshToken,
            expiresAt: expiryDate
        }

        // insert the new token
        await db
        .insert(refreshTokens)
        .values(newToken)

        return {
            userId: userId,
            email: data.email,
            name: data.name,
            accessToken,
            refreshToken
        }
    },

    async getAccount(userId: number) {
        const [userAccount] = await db
        .select()
        .from(users)
        .where(eq(users.userId, userId))

        if(!userAccount) {
            throw new ApiError(404, "Not Found")
        }

        //extract data without the password
        const { password, googleId, sellerReviewSum, buyerReviewSum , ...userInfo} = userAccount

        //return the data without the password
        return userInfo
    },

    async requestVerification(userId: number, data: requestVerificationType) {
        const [[user], [existingRecord]] = await Promise.all([
            db
            .select()
            .from(users)
            .where(eq(users.userId, userId)),
        
            db
            .select()
            .from(otps)
            .where(eq(otps.userId, userId))
        ])

        if(!user) return
        if(user.isVerified) return
        if(existingRecord && existingRecord.expiresAt > new Date()) return

        await db.transaction(async (tx) => {
            const otp = generateOTP()

            const newRecord: NewOTP = {
                userId: userId,
                otpHash: hashOTP(otp),
                expiresAt: new Date(Date.now() + 5*60*1000)
            }

            await tx
            .delete(otps)
            .where(eq(otps.userId, userId))

            await tx
            .update(users)
            .set({
                phoneNo: data.phoneNo
            })
            .where(eq(users.userId, userId))

            await tx
            .insert(otps)
            .values(newRecord)

            sendOtp(data.phoneNo, otp)
        })
    },

    async verifyPhoneNo(userId: number, data: verifyPhoneNoType) {
        //check for the token in the database
        const [tokenRecord] = await db
        .select()
        .from(otps)
        .where((eq(otps.userId, userId)))

        //if token doesn't exists throw error
        if(!tokenRecord) {
            throw new ApiError(403, "Access denied")
        }

        //if the token is expired throw error
        if(tokenRecord.expiresAt < new Date()) {
            // delete the expired token
            await db
            .delete(otps)
            .where(eq(otps.tokenId, tokenRecord.tokenId))

            throw new ApiError(400, "Token Expired. Please, re-request the verification")
        }

        if(tokenRecord.otpHash !== hashOTP(data.otp)) {
            throw new ApiError(400, "Invalid OTP")
        }

        // update the user to verified
        await db.transaction(async (tx) => {
            tx
            .update(users)
            .set({
                isVerified: true
            })
            .where(eq(users.userId, tokenRecord.userId)),

            // delete the otp
            await db
            .delete(otps)
            .where(eq(otps.userId, tokenRecord.userId))
        })
    }
}