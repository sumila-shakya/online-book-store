export interface User {
  userId: number;
  name: string;
  email: string;
  phoneNo?: string | null;
  isVerified: boolean;
  authProvider?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponseData {
  userId: number;
  name: string;
  email: string;
  accessToken: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RequestVerificationPayload {
  phoneNo: string;
}

export interface VerifyPhonePayload {
  phoneNo: string;
  otp: string;
}
