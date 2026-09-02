"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, QrCode } from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

interface SearchBarProps {
  value?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  value = "",
  onSearch,
  placeholder = "Search books by title, author, ISBN...",
  debounceMs = 400,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onSearch(val);
    }, debounceMs);
  };

  const handleClear = () => {
    setInputValue("");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onSearch("");
  };

  const isIsbnPattern = (term: string) => {
    const cleaned = term.trim().replace(/[-\s]/g, "");
    return /^\d{10}$|^\d{13}$|^\d{9}[\dX]$/i.test(cleaned);
  };

  const isIsbn = isIsbnPattern(inputValue);

  return (
    <div className="relative flex items-center w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
      
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="pl-10 pr-20 h-10 text-sm rounded-xl border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80 focus-visible:ring-emerald-500 focus-visible:bg-white dark:focus-visible:bg-slate-900 transition-colors"
      />

      <div className="absolute right-3 flex items-center gap-1.5">
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {isIsbn && (
          <Badge
            variant="outline"
            className="hidden sm:flex items-center gap-1 border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-[10px] font-semibold px-1.5 py-0.5"
          >
            <QrCode className="h-3 w-3" />
            <span>ISBN</span>
          </Badge>
        )}
      </div>
    </div>
  );
}
