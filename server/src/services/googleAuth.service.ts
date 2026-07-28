import { OAuth2Client } from "google-auth-library";
import { ApiError } from "../utils/apiError";

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

export const verifyWithGoogle = async(authenticationCode: string) => {
    const { tokens }= await googleClient.getToken(authenticationCode)
    const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    if(!payload) {
        throw new ApiError(400, "Invalid google token payload")
    }

    return {
        name: payload.name!,
        email: payload.email!,
        googleId: payload.sub
    }
}