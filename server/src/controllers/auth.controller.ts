import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { authServices } from "../services/auth.service";
import { registrationSchema, loginSchema, registrationType, loginType } from "../utils/validator";

export const authController = {
    async registerUser(req: Request, res: Response, next: NextFunction) {
        try {
            // validate the user data
            const validatedData: registrationType = registrationSchema.parse(req.body)

            // register the new user
            const newUser = await authServices.registerUser(validatedData)

            // send 201 successfully created message
            res
            .status(201)
            .json(new ApiResponse(201, newUser, "User registered successfully"))
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

            // send 200 successfully login message
            res.status(200)
            .json(new ApiResponse(200, user, "User logged in successfully"))
        } catch(error) {
            next(error)
        }
    }
}