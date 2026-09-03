import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { BooksResponseData, BookDetailData, BookFilterParams } from "../types/books";

export const getBooks = async (params: BookFilterParams): Promise<BooksResponseData> => {
  const response = await apiClient.get<ApiResponse<BooksResponseData>>("/books", {
    params,
  });
  return response.data.data;
};

export const getBookById = async (listingId: number): Promise<BookDetailData> => {
  const response = await apiClient.get<ApiResponse<BookDetailData>>(`/books/${listingId}`);
  return response.data.data;
};
