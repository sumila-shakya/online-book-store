"use client";

import React from "react";
import Image from "next/image";
import { BookOpen, Star, UserCheck, Tag } from "lucide-react";
import { BookListingSummary, BookCondition } from "../../lib/types/books";
import { Badge } from "../ui/badge";

interface BookCardProps {
  listing: BookListingSummary;
  onClick?: () => void;
}

const conditionBadgeStyles: Record<BookCondition, string> = {
  like_new: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  very_good: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  good: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  fair: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  poor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
};

const conditionLabels: Record<BookCondition, string> = {
  like_new: "Like New",
  very_good: "Very Good",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export function BookCard({ listing, onClick }: BookCardProps) {
  const formattedPrice = new Intl.NumberFormat("ne-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-800 dark:to-slate-900 text-slate-400">
            <BookOpen className="h-12 w-12 text-emerald-600/40 dark:text-emerald-400/40 mb-2" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2">
              {listing.title}
            </p>
          </div>
        )}

        {/* Condition Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="outline"
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-xs border capitalize ${
              conditionBadgeStyles[listing.bookCondition] || "bg-slate-100 text-slate-800"
            }`}
          >
            {conditionLabels[listing.bookCondition] || listing.bookCondition}
          </Badge>
        </div>
      </div>

      {/* Card Details */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {listing.title}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Price</span>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {formattedPrice}
            </p>
          </div>

          {/* Seller Rating info */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <UserCheck className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate max-w-[90px]">{listing.sellerName}</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-xs text-amber-500 font-bold mt-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>
                {listing.sellerRating !== null
                  ? Number(listing.sellerRating).toFixed(1)
                  : "New"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
