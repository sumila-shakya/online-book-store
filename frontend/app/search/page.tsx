"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Search, ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { useSearch } from "../../context/search-context";
import { useBooksQuery } from "../../hooks/use-books";
import { BookGrid } from "../../components/books/book-grid";
import { Pagination } from "../../components/books/pagination";
import { AuthRequiredDialog } from "../../components/books/auth-required-dialog";
import { Button } from "../../components/ui/button";

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { searchQuery } = useSearch();

  const [page, setPage] = useState(1);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [targetRedirectUrl, setTargetRedirectUrl] = useState<string>("/login");

  // Fetch books matching searchQuery or all books if searchQuery is empty
  const { data, isLoading } = useBooksQuery({
    q: searchQuery.trim() || undefined,
    page: page,
    limit: 12,
  });

  const handleBookClick = (listingId: number) => {
    const targetUrl = `/books/${listingId}`;
    if (!user) {
      setTargetRedirectUrl(targetUrl);
      setAuthDialogOpen(true);
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 -ml-2 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <span>Book Marketplace</span>
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {searchQuery ? (
              <>
                Showing search results for &quot;
                <span className="font-semibold text-slate-800 dark:text-slate-200">{searchQuery}</span>
                &quot;
              </>
            ) : (
              "Explore all secondhand textbooks and listings available for trade"
            )}
          </p>
        </div>

        {data?.paginationInfo && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
            <span>{data.paginationInfo.totalBooksCount} Total Books Listed</span>
          </div>
        )}
      </div>

      {/* Book Grid */}
      <BookGrid
        listings={data?.listings || []}
        isLoading={isLoading}
        onBookClick={handleBookClick}
      />

      {/* Pagination */}
      {data?.paginationInfo && (
        <Pagination
          pagination={data.paginationInfo}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      {/* Auth Modal when unauthenticated user clicks a book */}
      <AuthRequiredDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        redirectUrl={targetRedirectUrl}
      />
    </main>
  );
}
