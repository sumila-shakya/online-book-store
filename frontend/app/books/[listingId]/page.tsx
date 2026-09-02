"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Star,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  Tag,
  Calendar,
  Building,
  Globe,
  FileText,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../../context/auth-context";
import { useBookDetailQuery } from "../../../hooks/use-books";
import { AuthRequiredDialog } from "../../../components/books/auth-required-dialog";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

interface BookDetailPageProps {
  params: Promise<{ listingId: string }>;
}

export default function BookDetailPage({ params }: BookDetailPageProps) {
  const resolvedParams = use(params);
  const listingId = parseInt(resolvedParams.listingId, 10);

  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Enable query if user is logged in
  const { data: bookDetail, isLoading, error } = useBookDetailQuery(listingId, !!user);

  // If auth finished loading and user is not logged in, trigger modal
  React.useEffect(() => {
    if (!authLoading && !user) {
      setAuthDialogOpen(true);
    }
  }, [authLoading, user]);

  const formattedPrice = bookDetail
    ? new Intl.NumberFormat("ne-NP", {
        style: "currency",
        currency: "NPR",
        maximumFractionDigits: 0,
      }).format(bookDetail.price)
    : "";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Marketplace</span>
      </Button>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-pulse">
          <div className="md:col-span-5 aspect-3/4 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="md:col-span-7 space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && user && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900/50 dark:bg-rose-950/40">
          <h3 className="text-xl font-bold text-rose-800 dark:text-rose-300">
            Failed to Load Book Details
          </h3>
          <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">
            {(error as any)?.response?.data?.message || (error as any)?.message || "Listing not found or access denied."}
          </p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Return Home
          </Button>
        </div>
      )}

      {/* Main Content when loaded */}
      {bookDetail && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Cover Image & Condition */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-3/4 w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-lg">
              {bookDetail.bookInfo.imageUrl ? (
                <Image
                  src={bookDetail.bookInfo.imageUrl}
                  alt={bookDetail.bookInfo.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center"
                  priority
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-800 dark:to-slate-900 text-slate-400">
                  <BookOpen className="h-20 w-20 text-emerald-600/40 dark:text-emerald-400/40 mb-4" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No Cover Image Provided
                  </p>
                </div>
              )}

              <div className="absolute top-4 left-4">
                <Badge variant="default" className="text-sm px-3 py-1 font-semibold shadow-md">
                  Condition: {bookDetail.bookCondition}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Seller Profile & Order CTA */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl">
                {bookDetail.bookInfo.title}
              </h1>

              {bookDetail.bookInfo.subtitle && (
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  {bookDetail.bookInfo.subtitle}
                </p>
              )}

              {bookDetail.bookInfo.authors && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  By {bookDetail.bookInfo.authors.split(";").join(", ")}
                </p>
              )}
            </div>

            {/* Price Tag Box */}
            <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                  Listing Price
                </span>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formattedPrice}
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-bold border-emerald-500 text-emerald-700 dark:text-emerald-300 uppercase">
                {bookDetail.listingStatus}
              </Badge>
            </div>

            {/* Book Description */}
            {bookDetail.bookInfo.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-2">
                  {bookDetail.bookInfo.description}
                </p>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {bookDetail.bookInfo.isbn && (
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <Tag className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">ISBN</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {bookDetail.bookInfo.isbn}
                    </p>
                  </div>
                </div>
              )}

              {bookDetail.bookInfo.publisher && (
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <Building className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Publisher</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {bookDetail.bookInfo.publisher}
                    </p>
                  </div>
                </div>
              )}

              {bookDetail.bookInfo.publishedDate && (
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Published</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {bookDetail.bookInfo.publishedDate}
                    </p>
                  </div>
                </div>
              )}

              {bookDetail.bookInfo.pageCount && (
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Pages</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {bookDetail.bookInfo.pageCount}
                    </p>
                  </div>
                </div>
              )}

              {bookDetail.bookInfo.language && (
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <Globe className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Language</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                      {bookDetail.bookInfo.language}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Seller Profile Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Seller Information
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg">
                    {bookDetail.sellerInfo.sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{bookDetail.sellerInfo.sellerName}</span>
                      {bookDetail.sellerInfo.isVerified && (
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-500">Member Seller</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 border border-amber-200/60 dark:border-amber-800">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                    {bookDetail.sellerInfo.sellerRating !== null
                      ? Number(bookDetail.sellerInfo.sellerRating).toFixed(1)
                      : "New Seller"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="pt-4">
              <Button size="lg" className="w-full text-base font-bold shadow-lg gap-2">
                <Bookmark className="h-5 w-5" />
                <span>Place Order / Reserve Book</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal when unauthenticated user lands directly on page */}
      <AuthRequiredDialog
        isOpen={authDialogOpen}
        onClose={() => {
          setAuthDialogOpen(false);
          router.push("/");
        }}
        redirectUrl={`/books/${listingId}`}
      />
    </main>
  );
}
