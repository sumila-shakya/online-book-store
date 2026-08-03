import crypto from 'crypto'

//generate reset token
export const generateOTP = (): string => {
    return crypto.randomInt(100000, 1000000).toString();
}

//hash reset token
export const hashOTP = (data: string): string => {
    return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
}

export const sendOtp = (phoneNo: string, otp: string): void => {
    console.log(`OTP: ${otp} send to phone no: ${phoneNo}`)
}