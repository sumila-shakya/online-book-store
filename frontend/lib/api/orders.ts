import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import {
  OrderFilterParams,
  PurchaseOrdersResponse,
  SalesOrdersResponse,
  OrderDetails,
  ReviewPayload,
} from "../types/orders";

export const placeOrder = async (listingId: number) => {
  const response = await apiClient.post<ApiResponse<any>>(`/books/${listingId}/place-order`);
  return response.data.data;
};

export const getPurchaseOrders = async (params: OrderFilterParams): Promise<PurchaseOrdersResponse> => {
  const response = await apiClient.get<ApiResponse<PurchaseOrdersResponse>>("/orders/purchase", {
    params,
  });
  return response.data.data;
};

export const getSalesOrders = async (params: OrderFilterParams): Promise<SalesOrdersResponse> => {
  const response = await apiClient.get<ApiResponse<SalesOrdersResponse>>("/orders/sales", {
    params,
  });
  return response.data.data;
};

export const getOrderDetails = async (orderId: number): Promise<OrderDetails> => {
  const response = await apiClient.get<ApiResponse<OrderDetails>>(`/orders/${orderId}`);
  return response.data.data;
};

export const cancelOrder = async (orderId: number) => {
  const response = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}`);
  return response.data;
};

export const confirmBuyerOrder = async (orderId: number) => {
  const response = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}/buyer-confirm`);
  return response.data;
};

export const confirmSellerOrder = async (orderId: number) => {
  const response = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}/seller-confirm`);
  return response.data;
};

export const submitBuyerReview = async (orderId: number, payload: ReviewPayload) => {
  const response = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}/review-buyer`, payload);
  return response.data;
};

export const submitSellerReview = async (orderId: number, payload: ReviewPayload) => {
  const response = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}/review-seller`, payload);
  return response.data;
};
