import { db } from "../config/mysql.config";
import { users, User, NewUser } from "../models/mysql.model";
import { eq } from "drizzle-orm";
import { ApiError } from "../utils/apiError";
import { registrationType, loginType } from "../utils/validator";
import { jwtUtils } from "../utils/jwt";
import { Payload } from "../@types/interface";
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
            userId: result.insertId
        }

        // generate the new access and refresh tokens
        const accessToken: string = jwtUtils.generateAccessToken(payload)

        return {
            userId: result.insertId,
            email: data.email,
            name: data.name,
            accessToken: accessToken
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
            userId: existingUser.userId
        }

        // generate the new access and refresh tokens
        const accessToken: string = jwtUtils.generateAccessToken(payload)

        return {
            userId: existingUser.userId,
            email: existingUser.email,
            name: existingUser.name,
            accessToken
        }
    }
}