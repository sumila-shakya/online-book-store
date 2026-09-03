"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { PaginationMetaData } from "../../lib/types/books";

interface PaginationProps {
  pagination: PaginationMetaData;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, totalBooksCount } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 my-8">
      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
        Showing Page <span className="font-bold text-slate-900 dark:text-slate-100">{page}</span> of{" "}
        <span className="font-bold text-slate-900 dark:text-slate-100">{totalPages}</span>{" "}
        ({totalBooksCount} total listings)
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
            .map((p, index, array) => {
              const showEllipsis = index > 0 && p - array[index - 1] > 1;
              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                      p === page
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
