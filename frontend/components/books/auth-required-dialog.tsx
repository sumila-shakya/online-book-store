"use client";

import React from "react";
import Link from "next/link";
import { LogIn, Lock } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";

interface AuthRequiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export function AuthRequiredDialog({
  isOpen,
  onClose,
  redirectUrl = "/login",
}: AuthRequiredDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Authentication Required"
      description="You need to sign in to your account to view full book details and connect with sellers."
    >
      <div className="space-y-6 pt-2">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
          <Lock className="h-8 w-8" />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="w-1/2">
            Cancel
          </Button>
          <Link
            href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}
            className="w-1/2"
          >
            <Button className="w-full flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
          </Link>
        </div>
      </div>
    </Dialog>
  );
}
