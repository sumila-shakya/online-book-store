"use client";

import { useQuery } from "@tanstack/react-query";
import { getBooks, getBookById } from "../lib/api/books";
import { BookFilterParams } from "../lib/types/books";

export const bookKeys = {
  all: ["books"] as const,
  list: (params: BookFilterParams) => ["books", "list", params] as const,
  detail: (listingId: number) => ["books", "detail", listingId] as const,
};

export function useBooksQuery(params: BookFilterParams) {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: () => getBooks(params),
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });
}

export function useBookDetailQuery(listingId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: bookKeys.detail(listingId),
    queryFn: () => getBookById(listingId),
    enabled: enabled && !isNaN(listingId) && listingId > 0,
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}
