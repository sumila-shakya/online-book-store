"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, User, LogOut, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { useLogoutMutation } from "../../hooks/use-auth";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { PhoneVerificationModal } from "../auth/phone-verification-modal";

export function Navbar() {
  const { user, isLoading, isVerified } = useAuth();
  const logoutMutation = useLogoutMutation();
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900 dark:text-slate-100 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="tracking-tight">PustakPasal</span>
          </Link>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {!isVerified ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowVerifyModal(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Verify Phone</span>
                  </Button>
                ) : (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verified</span>
                  </Badge>
                )}

                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-900">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    {user.name}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  isLoading={logoutMutation.isPending}
                  title="Sign Out"
                  className="text-slate-600 dark:text-slate-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Logout</span>
                </Button>
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

      <PhoneVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />
    </>
  );
}
