"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sellerApi, SellerFilterParams, ListByIsbnPayload } from "../lib/api/seller";
import { bookKeys } from "./use-books";

export const sellerKeys = {
  myListings: (params: SellerFilterParams) => ["seller", "my-listings", params] as const,
};

export function useMyListingsQuery(params: SellerFilterParams, enabled: boolean = true) {
  return useQuery({
    queryKey: sellerKeys.myListings(params),
    queryFn: () => sellerApi.getMyListings(params),
    enabled: enabled,
    staleTime: 1000 * 60 * 2, // 2 mins
  });
}

export function useListByIsbnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ListByIsbnPayload) => sellerApi.listBookByIsbn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      queryClient.invalidateQueries({ queryKey: ["seller"] });
    },
  });
}

export function useListManuallyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => sellerApi.listBookManually(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      queryClient.invalidateQueries({ queryKey: ["seller"] });
    },
  });
}
