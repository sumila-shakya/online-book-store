"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  PlusCircle,
  ShoppingBag,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Tag,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../../context/auth-context";
import { useMyListingsQuery } from "../../../hooks/use-seller";
import { BookCard } from "../../../components/books/book-card";
import { Pagination } from "../../../components/books/pagination";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { PhoneVerificationModal } from "../../../components/auth/phone-verification-modal";

type StatusFilter = "available" | "reserved" | "sold" | undefined;

export default function MyListingsPage() {
  const router = useRouter();
  const { user, isVerified, isLoading: authLoading } = useAuth();

  const [activeStatus, setActiveStatus] = useState<StatusFilter>(undefined);
  const [page, setPage] = useState(1);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const { data, isLoading, error } = useMyListingsQuery(
    {
      listingStatus: activeStatus,
      page: page,
      limit: 12,
    },
    !!user && isVerified
  );

  if (authLoading) {
    return <div className="p-8 text-center text-slate-500">Loading user profile...</div>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Login Required
        </h2>
        <p className="text-sm text-slate-500">
          Please log in to manage your seller listings and active books.
        </p>
        <Button onClick={() => router.push("/login?redirect=/seller/my-listings")}>
          Go to Sign In
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <span>My Book Listings</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your listed textbooks, check trade status, or publish new books for sale.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isVerified ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center gap-1.5"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Verify Phone to Sell</span>
            </Button>
          ) : (
            <Link href="/seller/list-book">
              <Button size="lg" className="font-bold gap-2 shadow-md">
                <PlusCircle className="h-5 w-5" />
                <span>List New Book for Sale</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Verification Notice */}
      {!isVerified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-200 text-base">
                Mobile Number Verification Required
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                To keep our student marketplace safe, you need to verify your phone number before your listings are visible to buyers.
              </p>
            </div>
          </div>
          <Button onClick={() => setShowVerifyModal(true)} className="shrink-0">
            Verify Phone Number
          </Button>
        </div>
      )}

      {/* Filter Tabs */}
      {isVerified && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {(
            [
              { label: "All Listings", value: undefined },
              { label: "Available", value: "available" },
              { label: "Reserved", value: "reserved" },
              { label: "Sold", value: "sold" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveStatus(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                activeStatus === tab.value
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Listings Grid */}
      {isVerified && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              Failed to load seller listings. Please try again.
            </div>
          ) : !data?.listings || data.listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center my-8 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mb-4">
                <PlusCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                No Listings Found
              </h3>
              <p className="mt-2 text-sm text-slate-500 max-w-md">
                You haven&apos;t listed any books for sale in this category yet. Click below to add your first textbook listing!
              </p>
              <Link href="/seller/list-book" className="mt-4">
                <Button className="font-bold gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>List a Book Now</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.listings.map((listing) => (
                <BookCard
                  key={listing.listingId}
                  listing={listing}
                  onClick={() => router.push(`/books/${listing.listingId}`)}
                />
              ))}
            </div>
          )}

          {data?.paginationInfo && (
            <Pagination
              pagination={data.paginationInfo}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </>
      )}

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />
    </main>
  );
}
