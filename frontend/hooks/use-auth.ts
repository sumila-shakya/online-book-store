"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../lib/api/auth";
import { setAccessToken } from "../lib/api/client";
import {
  LoginPayload,
  RegisterPayload,
  RequestVerificationPayload,
  VerifyPhonePayload,
} from "../lib/types/auth";
import { useAuth } from "../context/auth-context";

export const authKeys = {
  account: ["auth", "account"] as const,
};

// TanStack Query Hook: Fetch Current User Account
export function useUserAccountQuery(accessToken: string | null) {
  return useQuery({
    queryKey: authKeys.account,
    queryFn: async () => {
      const res = await authApi.getAccount();
      return res.data;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    retry: false,
  });
}

// TanStack Mutation: Login User
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { setAccessTokenState } = useAuth();

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: (res) => {
      if (res.success && res.data?.accessToken) {
        setAccessTokenState(res.data.accessToken);
        setAccessToken(res.data.accessToken);
        queryClient.invalidateQueries({ queryKey: authKeys.account });
      }
    },
  });
}

// TanStack Mutation: Register User
export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const { setAccessTokenState } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authApi.register(data),
    onSuccess: (res) => {
      if (res.success && res.data?.accessToken) {
        setAccessTokenState(res.data.accessToken);
        setAccessToken(res.data.accessToken);
        queryClient.invalidateQueries({ queryKey: authKeys.account });
      }
    },
  });
}

// TanStack Mutation: Logout User
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const { setAccessTokenState } = useAuth();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      setAccessTokenState(null);
      setAccessToken(null);
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    },
  });
}

// TanStack Mutation: Request Phone OTP Verification
export function useRequestVerificationMutation() {
  return useMutation({
    mutationFn: (data: RequestVerificationPayload) =>
      authApi.requestVerification(data),
  });
}

// TanStack Mutation: Verify Phone OTP
export function useVerifyPhoneMutation() {
  const queryClient = useQueryClient();
  const { setAccessTokenState } = useAuth();

  return useMutation({
    mutationFn: (data: VerifyPhonePayload) => authApi.verifyPhoneNo(data),
    onSuccess: (res) => {
      if (res.success && res.data?.accessToken) {
        setAccessTokenState(res.data.accessToken);
        setAccessToken(res.data.accessToken);
        queryClient.invalidateQueries({ queryKey: authKeys.account });
      }
    },
  });
}

// TanStack Mutation: Google Auth Sign In
export function useGoogleAuthMutation() {
  const queryClient = useQueryClient();
  const { setAccessTokenState } = useAuth();

  return useMutation({
    mutationFn: (credential: string) => authApi.googleSignIn(credential),
    onSuccess: (res) => {
      if (res.success && res.data?.accessToken) {
        setAccessTokenState(res.data.accessToken);
        setAccessToken(res.data.accessToken);
        queryClient.invalidateQueries({ queryKey: authKeys.account });
      }
    },
  });
}
