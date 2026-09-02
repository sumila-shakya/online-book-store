import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import {
  AuthResponseData,
  LoginPayload,
  RegisterPayload,
  RequestVerificationPayload,
  User,
  VerifyPhonePayload,
  RefreshTokenResponseData,
} from "../types/auth";

export const authApi = {
  async register(data: RegisterPayload) {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/register",
      data
    );
    return res.data;
  },

  async login(data: LoginPayload) {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      data
    );
    return res.data;
  },

  async logout() {
    const res = await apiClient.post<ApiResponse<{}>>("/auth/logout");
    return res.data;
  },

  async getAccount() {
    const res = await apiClient.get<ApiResponse<User>>("/auth/my-account");
    return res.data;
  },

  async refreshToken() {
    const res = await apiClient.post<ApiResponse<RefreshTokenResponseData>>(
      "/auth/refresh"
    );
    return res.data;
  },

  async requestVerification(data: RequestVerificationPayload) {
    const res = await apiClient.post<ApiResponse<string>>(
      "/auth/request-verification",
      data
    );
    return res.data;
  },

  async verifyPhoneNo(data: VerifyPhonePayload) {
    const res = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      "/auth/verify-phoneno",
      data
    );
    return res.data;
  },
};
