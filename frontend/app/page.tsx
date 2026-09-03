"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useBooksQuery } from "../hooks/use-books";
import { BookGrid } from "../components/books/book-grid";
import { AuthRequiredDialog } from "../components/books/auth-required-dialog";
import { Button } from "../components/ui/button";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [targetRedirectUrl, setTargetRedirectUrl] = useState<string>("/login");

  // Fetch only a preview list of books for landing page (limit: 6)
  const { data, isLoading } = useBooksQuery({
    page: 1,
    limit: 6,
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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 sm:p-14 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-100 border border-white/20">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Student Peer-to-Peer Book Exchange</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            Discover & Exchange Pre-loved Books Nearby
          </h1>

          <p className="text-base sm:text-lg text-emerald-50 max-w-2xl leading-relaxed">
            Trade textbooks directly with fellow students. Browse verified
            listings, search by ISBN, and enjoy dual-confirmation order
            security.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/search">
              <Button
                size="lg"
                className="bg-emerald-700! text-white-800 hover:bg-emerald-800! font-extrabold shadow-lg gap-2"
              >
                <span>Explore Book Marketplace</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {!user && (
              <Link href="/register">
                <Button
                  size="lg"
                  className="text-white! bg-emerald-700! hover:bg-emerald-800! font-bold"
                >
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Background Decorative Icon */}
        <BookOpen className="absolute -right-8 -bottom-10 h-72 w-72 text-white/10 pointer-events-none rotate-12" />
      </section>

      {/* Featured Preview Listings Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span>Featured Book Listings</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Handpicked recent textbook additions from verified student sellers
            </p>
          </div>

          <Link href="/search">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
            >
              <span>View All Books</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <BookGrid
          listings={data?.listings || []}
          isLoading={isLoading}
          onBookClick={handleBookClick}
        />

        {/* View All Books CTA Button */}
        <div className="flex justify-center pt-4">
          <Link href="/search">
            <Button size="lg" className="px-8 font-bold gap-2 shadow-md">
              <span>View All Books in Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Auth Modal when unauthenticated user clicks a book */}
      <AuthRequiredDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        redirectUrl={targetRedirectUrl}
      />
    </main>
  );
}
