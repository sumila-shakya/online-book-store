"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, User, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { useSearch } from "../../context/search-context";
import { Button } from "../ui/button";
import { SearchBar } from "../books/search-bar";
import { PhoneVerificationModal } from "../auth/phone-verification-modal";
import { AccountDrawer } from "./account-drawer";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isVerified } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAccountDrawer, setShowAccountDrawer] = useState(false);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (pathname !== "/search") {
      router.push("/search");
    }
  };

  const handleSearchFocus = () => {
    if (pathname !== "/search") {
      router.push("/search");
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900 dark:text-slate-100 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="tracking-tight hidden sm:inline">PustakPasal</span>
          </Link>

          {/* SearchBar in Navbar */}
          <div className="flex-1 max-w-md mx-1 sm:mx-4" onClick={handleSearchFocus}>
            <SearchBar
              value={searchQuery}
              onSearch={handleSearchChange}
              placeholder="Search books by title, author, ISBN..."
            />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {isLoading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Circular Account Icon Button */}
                <button
                  type="button"
                  onClick={() => setShowAccountDrawer(true)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold text-sm shadow-md hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                  title="Open Account Menu"
                >
                  {userInitial}

                  {/* Indicator status dot */}
                  {!isVerified && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950">
                      <ShieldAlert className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Account Drawer */}
      <AccountDrawer
        isOpen={showAccountDrawer}
        onClose={() => setShowAccountDrawer(false)}
        onOpenVerifyModal={() => setShowVerifyModal(true)}
      />

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />
    </>
  );
}
