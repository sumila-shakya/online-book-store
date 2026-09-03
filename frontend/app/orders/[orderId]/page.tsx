"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Phone,
  UserCheck,
  ShieldCheck,
  Star,
  BookOpen,
  XCircle,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../../context/auth-context";
import {
  useOrderDetailsQuery,
  useConfirmBuyerMutation,
  useConfirmSellerMutation,
  useCancelOrderMutation,
} from "../../../hooks/use-orders";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ReviewDialog } from "../../../components/orders/review-dialog";
import { AuthRequiredDialog } from "../../../components/books/auth-required-dialog";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.orderId, 10);

  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: orderDetails, isLoading, error } = useOrderDetailsQuery(orderId, !!user);

  const confirmBuyerMutation = useConfirmBuyerMutation();
  const confirmSellerMutation = useConfirmSellerMutation();
  const cancelOrderMutation = useCancelOrderMutation();

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleBuyerConfirm = async () => {
    setActionError(null);
    try {
      await confirmBuyerMutation.mutateAsync(orderId);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to confirm receipt.";
      setActionError(msg);
    }
  };

  const handleSellerConfirm = async () => {
    setActionError(null);
    try {
      await confirmSellerMutation.mutateAsync(orderId);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to confirm payment.";
      setActionError(msg);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? The listing will become available again.")) {
      return;
    }
    setActionError(null);
    try {
      await cancelOrderMutation.mutateAsync(orderId);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to cancel order.";
      setActionError(msg);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("ne-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const isBuyer = orderDetails
    ? user
      ? Number(user.userId) !== Number(orderDetails.counterParty.userId) && orderDetails.userRole === "buyer"
      : orderDetails.userRole === "buyer"
    : false;
  const status = orderDetails?.orderStatus;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/orders")}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Orders Hub</span>
      </Button>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900/50 dark:bg-rose-950/40 space-y-3">
          <h3 className="text-xl font-bold text-rose-800 dark:text-rose-300">
            Failed to Load Order Details
          </h3>
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {(error as any)?.response?.data?.message || (error as any)?.message || "Order not found or access denied."}
          </p>
          <Button className="mt-2" onClick={() => router.push("/orders")}>
            Return to Orders
          </Button>
        </div>
      )}

      {/* Loaded Order Content */}
      {orderDetails && (
        <div className="space-y-8">
          {/* Header & Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Order #{orderDetails.orderId}
                </h1>
                <Badge
                  variant="outline"
                  className="font-bold text-xs uppercase px-3 py-1 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                >
                  Role: {isBuyer ? "Buyer" : "Seller"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Placed on {formatDate(orderDetails.orderedAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {status === "pending" && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 text-sm py-1.5 px-3 font-semibold">
                  <Clock className="h-4 w-4 mr-1.5 inline" />
                  Pending Dual Confirmation
                </Badge>
              )}
              {status === "product_received" && (
                <Badge className="bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 text-sm py-1.5 px-3 font-semibold">
                  <CheckCircle2 className="h-4 w-4 mr-1.5 inline" />
                  Buyer Confirmed Receipt
                </Badge>
              )}
              {status === "successful" && (
                <Badge className="bg-emerald-600 text-white text-sm py-1.5 px-3 font-semibold">
                  <CheckCircle2 className="h-4 w-4 mr-1.5 inline" />
                  Transaction Completed
                </Badge>
              )}
              {status === "cancelled" && (
                <Badge variant="outline" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-sm py-1.5 px-3 font-semibold">
                  <XCircle className="h-4 w-4 mr-1.5 inline" />
                  Order Cancelled
                </Badge>
              )}
              {status === "failed" && (
                <Badge variant="outline" className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-sm py-1.5 px-3 font-semibold">
                  <AlertTriangle className="h-4 w-4 mr-1.5 inline" />
                  Order Expired / Failed
                </Badge>
              )}
            </div>
          </div>

          {/* Action Error Alert */}
          {actionError && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Dual Confirmation Progress Stepper (Only active for non-cancelled orders) */}
          {status !== "cancelled" && status !== "failed" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dual Confirmation Workflow
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                {/* Step 1 */}
                <div className={`flex flex-col p-4 rounded-2xl border transition-all ${
                  status === "pending" || status === "product_received" || status === "successful"
                    ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : "border-slate-200 dark:border-slate-800"
                }`}>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-extrabold">
                      1
                    </span>
                    <span>Order Reserved</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Listing reserved. Buyer & seller connect privately.
                  </p>
                </div>

                {/* Step 2 */}
                <div className={`flex flex-col p-4 rounded-2xl border transition-all ${
                  status === "product_received" || status === "successful"
                    ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : "border-slate-200 dark:border-slate-800 opacity-60"
                }`}>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                      status === "product_received" || status === "successful"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      2
                    </span>
                    <span>Buyer Confirms Receipt</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {orderDetails.myConfirmation && isBuyer
                      ? `Confirmed at ${formatDate(orderDetails.myConfirmation)}`
                      : orderDetails.counterPartyConfirmation && !isBuyer
                      ? `Buyer confirmed at ${formatDate(orderDetails.counterPartyConfirmation)}`
                      : "Awaiting buyer physical receipt confirmation."}
                  </p>
                </div>

                {/* Step 3 */}
                <div className={`flex flex-col p-4 rounded-2xl border transition-all ${
                  status === "successful"
                    ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : "border-slate-200 dark:border-slate-800 opacity-60"
                }`}>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                      status === "successful"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      3
                    </span>
                    <span>Seller Confirms Payment</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {status === "successful"
                      ? "Payment confirmed! Listing marked as sold."
                      : "Awaiting seller payment confirmation."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Grid Layout: Counterparty Info & Book Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Counterparty Contact Card */}
            <div className="md:col-span-6 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {isBuyer ? "Seller Contact Details" : "Buyer Contact Details"}
                </span>
                {orderDetails.counterParty.isverified && (
                  <Badge className="bg-emerald-600 text-white text-[10px] gap-1 font-bold">
                    <ShieldCheck className="h-3 w-3" />
                    Verified User
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-extrabold text-xl shadow-md">
                  {orderDetails.counterParty.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {orderDetails.counterParty.name}
                  </h3>
                  {orderDetails.counterParty.userRating !== null ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{Number(orderDetails.counterParty.userRating).toFixed(1)} / 5.0 Rating</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">New User</span>
                  )}
                </div>
              </div>

              {/* Phone Action */}
              <div className="rounded-2xl border border-emerald-200 bg-white p-4 dark:border-emerald-900/60 dark:bg-slate-900 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Verified Contact Phone
                </span>
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={`tel:${orderDetails.counterParty.phoneNo}`}
                    className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 text-base hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{orderDetails.counterParty.phoneNo}</span>
                  </a>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyPhone(orderDetails.counterParty.phoneNo)}
                    className="h-8 gap-1 text-xs text-slate-500 hover:text-slate-900"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Coordinates delivery and cash/handover privately via phone before confirming completion on the platform.
              </p>
            </div>

            {/* Right: Book Overview Card */}
            <div className="md:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Book Listing Details
              </span>

              <div className="flex gap-4">
                <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                  {orderDetails.bookInfo.imageUrl ? (
                    <Image
                      src={orderDetails.bookInfo.imageUrl}
                      alt={orderDetails.bookInfo.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <BookOpen className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-2">
                    {orderDetails.bookInfo.title}
                  </h3>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-semibold">
                      Condition: {orderDetails.bookCondition}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Price</span>
                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(orderDetails.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Dual Confirmation Actions Panel */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Order Actions & Status Updates
            </h3>

            {/* Buyer Logic */}
            {isBuyer && (
              <>
                {status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      onClick={handleBuyerConfirm}
                      disabled={confirmBuyerMutation.isPending}
                      className="flex-1 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2"
                    >
                      {confirmBuyerMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Confirming...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Confirm Book Received</span>
                        </>
                      )}
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleCancelOrder}
                      disabled={cancelOrderMutation.isPending}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/50 font-bold"
                    >
                      {cancelOrderMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Cancel Order"
                      )}
                    </Button>
                  </div>
                )}

                {status === "product_received" && (
                  <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 dark:bg-sky-950/40 dark:border-sky-900/50 text-sm font-semibold text-sky-800 dark:text-sky-200 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-sky-600 shrink-0" />
                    <div>
                      <p>You have confirmed receiving the book.</p>
                      <p className="text-xs text-sky-600 dark:text-sky-400 font-normal mt-0.5">
                        Waiting for the seller ({orderDetails.counterParty.name}) to confirm payment receipt.
                      </p>
                    </div>
                  </div>
                )}

                {status === "successful" && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 dark:bg-emerald-950/40 dark:border-emerald-900/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                          Order Successfully Completed & Paid!
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                          How was your experience buying from {orderDetails.counterParty.name}?
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setReviewDialogOpen(true)}
                      className="font-bold bg-amber-500 hover:bg-amber-600 text-white gap-2 shrink-0"
                    >
                      <Star className="h-4 w-4 fill-white" />
                      <span>Rate Seller</span>
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Seller Logic */}
            {!isBuyer && (
              <>
                {status === "pending" && (
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950/40 dark:border-amber-900/50 text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-3">
                      <Clock className="h-6 w-6 text-amber-600 shrink-0" />
                      <div>
                        <p>Awaiting Buyer Confirmation</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-normal mt-0.5">
                          The buyer ({orderDetails.counterParty.name}) must first confirm they received the book.
                        </p>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleCancelOrder}
                      disabled={cancelOrderMutation.isPending}
                      className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/50 font-bold"
                    >
                      {cancelOrderMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Cancel Order"
                      )}
                    </Button>
                  </div>
                )}

                {status === "product_received" && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      The buyer has confirmed receiving the book. Once you receive your payment, click confirm below to complete the transaction and mark the listing as sold.
                    </p>
                    <Button
                      size="lg"
                      onClick={handleSellerConfirm}
                      disabled={confirmSellerMutation.isPending}
                      className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2"
                    >
                      {confirmSellerMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Confirming...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Confirm Payment Received & Complete Order</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {status === "successful" && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 dark:bg-emerald-950/40 dark:border-emerald-900/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                          Transaction Completed & Marked as Sold!
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                          How was your experience selling to {orderDetails.counterParty.name}?
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setReviewDialogOpen(true)}
                      className="font-bold bg-amber-500 hover:bg-amber-600 text-white gap-2 shrink-0"
                    >
                      <Star className="h-4 w-4 fill-white" />
                      <span>Rate Buyer</span>
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Cancelled or Failed Order Warning */}
            {(status === "cancelled" || status === "failed") && (
              <div className="rounded-2xl bg-slate-100 border border-slate-200 p-4 dark:bg-slate-800 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300">
                This order is {status}. No further confirmations can be made. The listing has been made available back on the marketplace.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Dialog */}
      {orderDetails && (
        <ReviewDialog
          isOpen={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          orderId={orderDetails.orderId}
          revieweeId={orderDetails.counterParty.userId}
          revieweeName={orderDetails.counterParty.name}
          isBuyerRole={isBuyer}
        />
      )}
    </main>
  );
}
