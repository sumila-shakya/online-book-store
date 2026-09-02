"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../lib/api/auth";
import { setAccessToken as setGlobalAccessToken } from "../lib/api/client";
import { User } from "../lib/types/auth";

export const authKeys = {
  account: ["auth", "account"] as const,
};

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isVerified: boolean;
  setAccessTokenState: (token: string | null) => void;
  refreshAccount: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const queryClient = useQueryClient();

  const setAccessTokenWrapper = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setGlobalAccessToken(token);
  }, []);

  // TanStack Query for User Account
  const {
    data: userAccount,
    isLoading: isUserLoading,
    refetch: refetchAccount,
  } = useQuery({
    queryKey: authKeys.account,
    queryFn: async () => {
      const res = await authApi.getAccount();
      return res.data;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    retry: false,
  });

  const clearAuth = useCallback(() => {
    setAccessTokenWrapper(null);
    queryClient.setQueryData(authKeys.account, null);
  }, [setAccessTokenWrapper, queryClient]);

  // Initial silent refresh token on app load
  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      try {
        const refreshRes = await authApi.refreshToken();
        if (isMounted && refreshRes.success && refreshRes.data?.accessToken) {
          setAccessTokenWrapper(refreshRes.data.accessToken);
        } else if (isMounted) {
          clearAuth();
        }
      } catch (err) {
        if (isMounted) clearAuth();
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    initializeAuth();

    const handleUnauthorized = () => {
      clearAuth();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [clearAuth, setAccessTokenWrapper]);

  const refreshAccount = async () => {
    if (accessToken) {
      await refetchAccount();
    }
  };

  const user = accessToken ? userAccount || null : null;
  const isLoading = isInitializing || (!!accessToken && isUserLoading);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isVerified: !!user?.isVerified,
        setAccessTokenState: setAccessTokenWrapper,
        refreshAccount,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
