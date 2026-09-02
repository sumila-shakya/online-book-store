"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  X,
  User,
  ShieldAlert,
  CheckCircle2,
  LogOut,
  ShoppingBag,
  PlusCircle,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { useLogoutMutation } from "../../hooks/use-auth";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVerifyModal: () => void;
}

export function AccountDrawer({
  isOpen,
  onClose,
  onOpenVerifyModal,
}: AccountDrawerProps) {
  const { user, isVerified } = useAuth();
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleLogout = () => {
    onClose();
    logoutMutation.mutate();
  };

  const handleVerifyClick = () => {
    onClose();
    onOpenVerifyModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col justify-between">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>Account Overview</span>
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close drawer</span>
              </button>
            </div>

            {/* Profile Info Card */}
            <div className="p-6 space-y-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold text-2xl shadow-md">
                  {userInitial}
                </div>
                <div className="space-y-1 truncate">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Phone Status */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Verification Status</span>
                {isVerified ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Phone Verified</span>
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Unverified</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Navigation Options List */}
            <div className="p-4 space-y-1">
              {!isVerified && (
                <button
                  onClick={handleVerifyClick}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/70 transition-colors font-semibold text-sm"
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    <span>Verify Phone Number</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rose-500" />
                </button>
              )}

              <Link
                href="/search"
                onClick={onClose}
                className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-slate-400" />
                  <span>Browse Book Marketplace</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>

              <div
                onClick={onClose}
                className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="h-5 w-5 text-slate-400" />
                  <span>List a Book for Sale</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                  Seller
                </Badge>
              </div>

              <div
                onClick={onClose}
                className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-slate-400" />
                  <span>My Orders & Transactions</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Footer / Logout */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={handleLogout}
              isLoading={logoutMutation.isPending}
              className="w-full flex items-center justify-center gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out Account</span>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
