"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Store,
  BookOpen,
  Calendar,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Star,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { usePurchaseOrdersQuery, useSalesOrdersQuery } from "../../hooks/use-orders";
import { OrderStatus, PurchaseOrderItem, SalesOrderItem } from "../../lib/types/orders";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { AuthRequiredDialog } from "../../components/books/auth-required-dialog";

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"purchases" | "sales">("purchases");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState<number>(1);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setAuthDialogOpen(true);
    }
  }, [authLoading, user]);

  const filterParams = {
    orderStatus: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit: 10,
  };

  const purchasesQuery = usePurchaseOrdersQuery(filterParams, !!user && activeTab === "purchases");
  const salesQuery = useSalesOrdersQuery(filterParams, !!user && activeTab === "sales");

  const isLoading = activeTab === "purchases" ? purchasesQuery.isLoading : salesQuery.isLoading;
  const error = activeTab === "purchases" ? purchasesQuery.error : salesQuery.error;

  const purchaseData = purchasesQuery.data?.purchaseOrders || [];
  const salesData = salesQuery.data?.salesOrders || [];
  const pagination =
    activeTab === "purchases"
      ? purchasesQuery.data?.paginationInfo
      : salesQuery.data?.paginationInfo;

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-semibold gap-1 py-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending Confirmation</span>
          </Badge>
        );
      case "product_received":
        return (
          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 font-semibold gap-1 py-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Buyer Confirmed Receipt</span>
          </Badge>
        );
      case "successful":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-semibold gap-1 py-1">
            <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-600 text-white" />
            <span>Order Completed</span>
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 font-semibold gap-1 py-1">
            <XCircle className="h-3.5 w-3.5" />
            <span>Cancelled</span>
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 font-semibold gap-1 py-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Failed / Expired</span>
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("ne-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Order Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your purchases, sales, and dual-confirmation status.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 border border-slate-200 dark:border-slate-700/60 self-start md:self-auto">
          <button
            onClick={() => {
              setActiveTab("purchases");
              setPage(1);
            }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "purchases"
                ? "bg-white text-emerald-600 shadow-md dark:bg-slate-900 dark:text-emerald-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>My Purchases</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("sales");
              setPage(1);
            }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "sales"
                ? "bg-white text-emerald-600 shadow-md dark:bg-slate-900 dark:text-emerald-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Store className="h-4 w-4" />
            <span>My Sales</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="h-3.5 w-3.5" />
          Filter:
        </span>
        {[
          { label: "All Statuses", value: "all" },
          { label: "Pending", value: "pending" },
          { label: "Buyer Confirmed", value: "product_received" },
          { label: "Completed", value: "successful" },
          { label: "Cancelled", value: "cancelled" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setStatusFilter(filter.value as OrderStatus | "all");
              setPage(1);
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all border ${
              statusFilter === filter.value
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900/50 dark:bg-rose-950/40">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
            Failed to load order records. Please try again.
          </p>
        </div>
      )}

      {/* Purchases List */}
      {!isLoading && activeTab === "purchases" && (
        <>
          {purchaseData.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-slate-50/50 dark:bg-slate-900/30">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                No Purchases Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {statusFilter !== "all"
                  ? `No purchases found matching status "${statusFilter}".`
                  : "You haven't placed any book orders yet."}
              </p>
              <Button
                className="mt-5 font-bold"
                onClick={() => router.push("/")}
              >
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseData.map((order: PurchaseOrderItem) => (
                <div
                  key={order.orderId}
                  onClick={() => router.push(`/orders/${order.orderId}`)}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                      {order.imageUrl ? (
                        <Image
                          src={order.imageUrl}
                          alt={order.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {renderStatusBadge(order.orderStatus)}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.orderedAt)}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {order.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Seller: <strong className="text-slate-700 dark:text-slate-300">{order.sellerName}</strong></span>
                        {order.sellerRating !== null && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {Number(order.sellerRating).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(order.price)}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Sales List */}
      {!isLoading && activeTab === "sales" && (
        <>
          {salesData.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-slate-50/50 dark:bg-slate-900/30">
              <Store className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                No Sales Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {statusFilter !== "all"
                  ? `No sales orders found matching status "${statusFilter}".`
                  : "No buyers have placed orders on your book listings yet."}
              </p>
              <Button
                className="mt-5 font-bold"
                onClick={() => router.push("/seller/list-book")}
              >
                List a Book for Sale
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {salesData.map((order: SalesOrderItem) => (
                <div
                  key={order.orderId}
                  onClick={() => router.push(`/orders/${order.orderId}`)}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                      {order.imageUrl ? (
                        <Image
                          src={order.imageUrl}
                          alt={order.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {renderStatusBadge(order.orderStatus)}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.orderedAt)}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {order.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Buyer: <strong className="text-slate-700 dark:text-slate-300">{order.buyerName}</strong></span>
                        {order.buyerRating !== null && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {Number(order.buyerRating).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(order.price)}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                      <span>Manage Order</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.totalBooksCount} orders)
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
              disabled={page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Unauthenticated Auth Modal */}
      <AuthRequiredDialog
        isOpen={authDialogOpen}
        onClose={() => {
          setAuthDialogOpen(false);
          router.push("/");
        }}
        redirectUrl="/orders"
      />
    </main>
  );
}
