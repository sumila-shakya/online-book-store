export type OrderStatus = 'pending' | 'product_received' | 'successful' | 'cancelled' | 'failed';

export interface OrderFilterParams {
  orderStatus?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  totalBooksCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface PurchaseOrderItem {
  orderId: number;
  orderStatus: OrderStatus;
  orderedAt: string;
  listingId: number;
  title: string;
  imageUrl: string | null;
  price: number;
  sellerId: number;
  sellerName: string;
  sellerRating: number | null;
}

export interface PurchaseOrdersResponse {
  paginationInfo: PaginationInfo;
  purchaseOrders: PurchaseOrderItem[];
}

export interface SalesOrderItem {
  orderId: number;
  orderStatus: OrderStatus;
  orderedAt: string;
  listingId: number;
  title: string;
  imageUrl: string | null;
  price: number;
  buyerId: number;
  buyerName: string;
  buyerRating: number | null;
}

export interface SalesOrdersResponse {
  paginationInfo: PaginationInfo;
  salesOrders: SalesOrderItem[];
}

export interface CounterPartyInfo {
  userId: number;
  name: string;
  userRating: number | null;
  phoneNo: string;
  isverified: boolean;
}

export interface BookInfoSummary {
  bookId: number;
  title: string;
  imageUrl: string | null;
}

export interface OrderDetails {
  orderId: number;
  orderedAt: string;
  orderStatus: OrderStatus;
  userRole: 'buyer' | 'seller';
  myConfirmation: string | null;
  counterPartyConfirmation: string | null;
  counterParty: CounterPartyInfo;
  bookInfo: BookInfoSummary;
  price: number;
  bookCondition: string;
}

export interface ReviewPayload {
  revieweeId: number;
  rating: number;
}
