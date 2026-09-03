import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { BooksResponseData, BookCondition } from "../types/books";

export interface ListByIsbnPayload {
  isbn: string;
  price: number;
  bookCondition: BookCondition;
}

export interface SellerFilterParams {
  listingStatus?: "available" | "reserved" | "sold";
  page?: number;
  limit?: number;
}

export const sellerApi = {
  getMyListings: async (params: SellerFilterParams): Promise<BooksResponseData> => {
    const response = await apiClient.get<ApiResponse<BooksResponseData>>("/sellers/my-list", {
      params,
    });
    return response.data.data;
  },

  listBookByIsbn: async (payload: ListByIsbnPayload) => {
    const response = await apiClient.post<ApiResponse<any>>("/books/isbn", payload);
    return response.data;
  },

  listBookManually: async (formData: FormData) => {
    const response = await apiClient.post<ApiResponse<any>>("/books/manual", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
