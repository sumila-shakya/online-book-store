export type BookCondition = 'As New' | 'Fine' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
export type ListingStatus = 'available' | 'reserved' | 'sold';

export interface BookListingSummary {
  listingId: number;
  sellerId: number;
  sellerName: string;
  sellerRating: number | null;
  bookId: number;
  title: string;
  imageUrl: string | null;
  price: number;
  bookCondition: BookCondition;
  listedAt: string;
  listingStatus: ListingStatus;
}

export interface PaginationMetaData {
  totalBooksCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface BooksResponseData {
  paginationInfo: PaginationMetaData;
  listings: BookListingSummary[];
}

export interface BookInformation {
  title: string;
  subtitle?: string;
  authors?: string;
  isbn?: string;
  description?: string;
  imageUrl?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  language?: string;
  categories?: string[];
}

export interface SellerInfo {
  sellerId: number;
  sellerName: string;
  sellerRating: number | null;
  phoneNo: string | null;
  isVerified: boolean;
}

export interface BookDetailData {
  listingId: number;
  sellerInfo: SellerInfo;
  bookInfo: BookInformation;
  price: number;
  bookCondition: BookCondition;
  listingStatus: ListingStatus;
  listedAt: string;
}

export interface BookFilterParams {
  q?: string;
  page?: number;
  limit?: number;
}
