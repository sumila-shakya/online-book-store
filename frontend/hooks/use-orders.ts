"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  placeOrder,
  getPurchaseOrders,
  getSalesOrders,
  getOrderDetails,
  cancelOrder,
  confirmBuyerOrder,
  confirmSellerOrder,
  submitBuyerReview,
  submitSellerReview,
} from "../lib/api/orders";
import { OrderFilterParams, ReviewPayload } from "../lib/types/orders";
import { bookKeys } from "./use-books";

export const orderKeys = {
  all: ["orders"] as const,
  purchases: (params: OrderFilterParams) => ["orders", "purchases", params] as const,
  sales: (params: OrderFilterParams) => ["orders", "sales", params] as const,
  detail: (orderId: number) => ["orders", "detail", orderId] as const,
};

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: number) => placeOrder(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}

export function usePurchaseOrdersQuery(params: OrderFilterParams, enabled: boolean = true) {
  return useQuery({
    queryKey: orderKeys.purchases(params),
    queryFn: () => getPurchaseOrders(params),
    enabled,
    staleTime: 1000 * 30, // 30s
  });
}

export function useSalesOrdersQuery(params: OrderFilterParams, enabled: boolean = true) {
  return useQuery({
    queryKey: orderKeys.sales(params),
    queryFn: () => getSalesOrders(params),
    enabled,
    staleTime: 1000 * 30, // 30s
  });
}

export function useOrderDetailsQuery(orderId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderDetails(orderId),
    enabled: enabled && !!orderId,
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
}

export function useConfirmBuyerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => confirmBuyerOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
}

export function useConfirmSellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => confirmSellerOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
}

export function useSubmitReviewMutation(isBuyer: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: ReviewPayload }) =>
      isBuyer ? submitSellerReview(orderId, payload) : submitBuyerReview(orderId, payload),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
}
