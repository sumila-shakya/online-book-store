import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { authServices } from "../services/auth.service";
import { registrationSchema, loginSchema, googleCodeSchema, requestVerificationSchema, verifyPhoneNoSchema, 
        registrationType, loginType, googleCodeType, requestVerificationType, verifyPhoneNoType } from "../validator/auth.validator";
import { COOKIES_OPTIONS } from "../utils/constants";
import { jwtUtils } from "../utils/jwt";
import { Payload } from "../@types/interface";

export const authController = {
    async registerUser(req: Request, res: Response, next: NextFunction) {
        try {
            // validate the user data
            const validatedData: registrationType = registrationSchema.parse(req.body)

            // register the new user
            const newUser = await authServices.registerUser(validatedData)

            // seperate the refresh token from the rest of the data 
            const {refreshToken, ...data} = newUser

            // send 201 successfully created message
            res
            .status(201)
            .cookie('refreshToken', refreshToken, COOKIES_OPTIONS)
            .json(new ApiResponse(201, data, "User registered successfully"))
        } catch(error) {
            next(error)
        }
    },

    async loginUser(req: Request, res: Response, next: NextFunction) {
        try {
            // validate the user data
            const validatedData: loginType = loginSchema.parse(req.body)

            // get the user data
            const user = await authServices.loginUser(validatedData)

            // seperate the refresh token from the rest of the data 
            const {refreshToken, ...data} = user

            // send 200 successfully login message
            res
            .status(200)
            .cookie('refreshToken', refreshToken, COOKIES_OPTIONS)
            .json(new ApiResponse(200, data, "User logged in successfully"))
        } catch(error) {
            next(error)
        }
    },

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            // delete the refresh token from the database
            await authServices.logout(userId)

            // cookies option
            const options = {
                httpOnly: true,
                sameSite: "lax" as const
            }

            // send 200 successfully login message
            res.status(200)
            .clearCookie('refreshToken', options)
            .json(new ApiResponse(200, {}, "User logged out successfully"))

        } catch(error) {
            next(error)
        }
    },

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            //get refresh token from the cookie
            const token = req.cookies?.refreshToken

            //throw error if token not present
            if(!token) {
                throw new ApiError(401,"Refresh token is required")
            }

            // extract the userId from the refresh token
            const { userId }: Payload = jwtUtils.verifyRefreshToken(token)

            //get the new access and refresh token
            const { accessToken, refreshToken } = await authServices.refreshToken(token, userId)

            // send 200 message
            res.status(200)
            .cookie('refreshToken', refreshToken, COOKIES_OPTIONS)
            .json(new ApiResponse(200, {accessToken}))
        } catch(error) {
            next(error)
        }
    },

    async signInWithGoogle(req: Request, res: Response, next: NextFunction) {
        try {
            // validate the user data
            const validatedData: googleCodeType = googleCodeSchema.parse(req.body)

            // get the user data
            const user = await authServices.signInWithGoogle(validatedData.credential)

            // seperate the refresh token from the rest of the data 
            const {refreshToken, ...data} = user

            // send 200 successfully login message
            res
            .status(200)
            .cookie('refreshToken', refreshToken, COOKIES_OPTIONS)
            .json(new ApiResponse(200, data, "User signed in successfully with Google"))
        } catch(error) {
            next(error)
        }
    },

    async getAccount(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            // get user account
            const userAccount = await authServices.getAccount(userId)

            // send 200 success message
            res
            .status(200)
            .json(new ApiResponse(200, userAccount))
        } catch(error) {
            next(error)
        }
    },

    async requestVerification(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            const data: requestVerificationType = requestVerificationSchema.parse(req.body)

            await authServices.requestVerification(userId, data)

            res
            .status(200)
            .json(new ApiResponse(200, "Please check your phone number to get otp"))
        } catch(error) {
            next(error)
        }
    },

    async verifyPhoneNo(req: Request, res: Response, next: NextFunction) {
        try {
            // get the user id
            const userId = req.user?.userId

            // if the userId is missing throw error
            if(!userId) {
                throw new ApiError(401, "Access Denied")
            }

            const data: verifyPhoneNoType = verifyPhoneNoSchema.parse(req.body)

            const {refreshToken, accessToken} = await authServices.verifyPhoneNo(userId, data)

            res
            .status(200)
            .cookie('refreshToken', refreshToken, COOKIES_OPTIONS)
            .json(new ApiResponse(200, {accessToken},"Your phone number is successfully verified"))
        } catch(error) {
            next(error)
        }
    }
}