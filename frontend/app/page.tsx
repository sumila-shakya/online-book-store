"use client";

import Link from "next/link";
import { BookOpen, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function Home() {
  const { user, isVerified } = useAuth();

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center space-y-6">
     

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-slate-100 max-w-3xl">
          Discover & Sell Books in a Secure Peer-to-Peer Marketplace
        </h1>

        <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Connect directly with book sellers and buyers. Sign up, verify your mobile number, and start trading books effortlessly.
        </p>

        {user ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 max-w-md w-full text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Phone Status</span>
              {isVerified ? (
                <Badge variant="default" className="gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </Badge>
              ) : (
                <Link href="/verify-phone">
                  <Badge variant="destructive" className="gap-1 cursor-pointer">
                    Unverified (Click to Verify)
                  </Badge>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
