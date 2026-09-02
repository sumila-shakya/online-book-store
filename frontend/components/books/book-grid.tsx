"use client";

import React from "react";
import { BookListingSummary } from "../../lib/types/books";
import { BookCard } from "./book-card";
import { BookX } from "lucide-react";

interface BookGridProps {
  listings: BookListingSummary[];
  isLoading?: boolean;
  onBookClick?: (listingId: number) => void;
}

export function BookGrid({ listings, isLoading = false, onBookClick }: BookGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 animate-pulse space-y-4"
          >
            <div className="aspect-3/4 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-6 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center my-8 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-4">
          <BookX className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          No Book Listings Found
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
          We couldn&apos;t find any books matching your search query. Try searching with a different title, author name, or ISBN.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <BookCard
          key={listing.listingId}
          listing={listing}
          onClick={() => onBookClick && onBookClick(listing.listingId)}
        />
      ))}
    </div>
  );
}
