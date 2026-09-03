"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  BookPlus,
  QrCode,
  FileEdit,
  ArrowLeft,
  Upload,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../../context/auth-context";
import { useListByIsbnMutation, useListManuallyMutation } from "../../../hooks/use-seller";
import { BookCondition } from "../../../lib/types/books";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { PhoneVerificationModal } from "../../../components/auth/phone-verification-modal";

const BOOK_CONDITIONS: { value: BookCondition; label: string }[] = [
  { value: "like_new", label: "Like New" },
  { value: "very_good", label: "Very Good" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

// Zod schemas
const isbnSchema = z.object({
  isbn: z
    .string()
    .min(10, "ISBN must be at least 10 characters")
    .max(20, "ISBN must be at most 20 characters")
    .transform((val) => val.replace(/[-\s]/g, "")),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  bookCondition: z.enum([
    "like_new",
    "very_good",
    "good",
    "fair",
    "poor",
  ] as const, { required_error: "Please select a condition" }),
});

const manualSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").trim(),
  authors: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  bookCondition: z.enum([
    "like_new",
    "very_good",
    "good",
    "fair",
    "poor",
  ] as const, { required_error: "Please select a condition" }),
  description: z.string().optional(),
});

type IsbnFormValues = z.infer<typeof isbnSchema>;
type ManualFormValues = z.infer<typeof manualSchema>;

export default function ListBookPage() {
  const router = useRouter();
  const { user, isVerified, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"isbn" | "manual">("isbn");
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const listByIsbnMutation = useListByIsbnMutation();
  const listManuallyMutation = useListManuallyMutation();

  // RHF for ISBN form
  const isbnForm = useForm<IsbnFormValues>({
    resolver: zodResolver(isbnSchema),
    defaultValues: {
      isbn: "",
      price: 0,
      bookCondition: "very_good",
    },
  });

  // RHF for Manual form
  const manualForm = useForm<ManualFormValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: {
      title: "",
      authors: "",
      price: 0,
      bookCondition: "very_good",
      description: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const onIsbnSubmit = (data: IsbnFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    listByIsbnMutation.mutate(data, {
      onSuccess: (res) => {
        setSuccessMessage("Book listed successfully via ISBN lookup!");
        setTimeout(() => {
          router.push("/seller/my-listings");
        }, 1500);
      },
      onError: (err: any) => {
        setErrorMessage(
          err?.response?.data?.message || "Failed to list book by ISBN. Please try manual entry."
        );
      },
    });
  };

  const onManualSubmit = (data: ManualFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("price", data.price.toString());
    formData.append("bookCondition", data.bookCondition);

    if (data.authors) formData.append("authors", data.authors);
    if (data.description) formData.append("description", data.description);
    if (coverFile) formData.append("cover", coverFile);

    listManuallyMutation.mutate(formData, {
      onSuccess: () => {
        setSuccessMessage("Book listed successfully!");
        setTimeout(() => {
          router.push("/seller/my-listings");
        }, 1500);
      },
      onError: (err: any) => {
        setErrorMessage(
          err?.response?.data?.message || "Failed to create manual book listing."
        );
      },
    });
  };

  if (authLoading) {
    return <div className="p-8 text-center text-slate-500">Checking authentication...</div>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600">
          <BookPlus className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Login Required
        </h2>
        <p className="text-sm text-slate-500">
          You need to be logged in to create a book listing for sale.
        </p>
        <Button onClick={() => router.push("/login?redirect=/seller/list-book")}>
          Go to Sign In
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/seller/my-listings")}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>My Listings</span>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <BookPlus className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <span>List a Book for Sale</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Add a secondhand textbook to the marketplace for nearby students to browse and buy.
            </p>
          </div>

          {!isVerified && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Verify Mobile Number to List</span>
            </Button>
          )}
        </div>
      </div>

      {/* Unverified Warning Banner */}
      {!isVerified && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                Mobile Phone Verification Required
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                You must verify your phone number before creating book listings to ensure trade security.
              </p>
            </div>
          </div>
          <Button size="sm" variant="destructive" onClick={() => setShowVerifyModal(true)}>
            Verify Now
          </Button>
        </div>
      )}

      {/* Alert Banners */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Tabbed Form Container */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setActiveTab("isbn")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "isbn"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Option 1: Quick ISBN Lookup</span>
            <span className="hidden sm:inline-block text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
              Auto-Fetch
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "manual"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <FileEdit className="h-4 w-4" />
            <span>Option 2: Manual Form Entry</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {/* ISBN Form */}
          {activeTab === "isbn" && (
            <form onSubmit={isbnForm.handleSubmit(onIsbnSubmit)} className="space-y-6">
              <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>
                  Enter the 10 or 13-digit ISBN number printed on the back cover of your book. We will automatically retrieve the title, cover art, author, and edition details!
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="isbn">ISBN Number *</Label>
                  <Input
                    id="isbn"
                    placeholder="e.g. 9780131103627 or 0131103628"
                    {...isbnForm.register("isbn")}
                    className="mt-1"
                  />
                  {isbnForm.formState.errors.isbn && (
                    <p className="text-xs font-semibold text-rose-500 mt-1">
                      {isbnForm.formState.errors.isbn.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="isbn-price">Selling Price (NPR) *</Label>
                    <Input
                      id="isbn-price"
                      type="number"
                      placeholder="e.g. 500"
                      {...isbnForm.register("price")}
                      className="mt-1"
                    />
                    {isbnForm.formState.errors.price && (
                      <p className="text-xs font-semibold text-rose-500 mt-1">
                        {isbnForm.formState.errors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="isbn-condition">Book Condition *</Label>
                    <select
                      id="isbn-condition"
                      {...isbnForm.register("bookCondition")}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {BOOK_CONDITIONS.map((cond) => (
                        <option key={cond.value} value={cond.value}>
                          {cond.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!isVerified}
                isLoading={listByIsbnMutation.isPending}
                className="w-full font-bold shadow-lg"
              >
                <span>Publish ISBN Listing</span>
              </Button>
            </form>
          )}

          {/* Manual Form */}
          {activeTab === "manual" && (
            <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-6">
              {/* Cover Image Upload */}
              <div className="space-y-2">
                <Label>Cover Photo (Optional)</Label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Upload className="h-6 w-6" />
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <input
                      type="file"
                      id="cover-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="cover-upload">
                      <Button type="button" variant="outline" size="sm" className="cursor-pointer">
                        Choose Image File
                      </Button>
                    </label>
                    <p className="text-xs text-slate-500">
                      Supports PNG, JPG, or WEBP images up to 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="manual-title">Book Title *</Label>
                  <Input
                    id="manual-title"
                    placeholder="e.g. Introduction to Algorithms"
                    {...manualForm.register("title")}
                    className="mt-1"
                  />
                  {manualForm.formState.errors.title && (
                    <p className="text-xs font-semibold text-rose-500 mt-1">
                      {manualForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="manual-authors">Author(s)</Label>
                  <Input
                    id="manual-authors"
                    placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
                    {...manualForm.register("authors")}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manual-price">Selling Price (NPR) *</Label>
                    <Input
                      id="manual-price"
                      type="number"
                      placeholder="e.g. 750"
                      {...manualForm.register("price")}
                      className="mt-1"
                    />
                    {manualForm.formState.errors.price && (
                      <p className="text-xs font-semibold text-rose-500 mt-1">
                        {manualForm.formState.errors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="manual-condition">Book Condition *</Label>
                    <select
                      id="manual-condition"
                      {...manualForm.register("bookCondition")}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {BOOK_CONDITIONS.map((cond) => (
                        <option key={cond.value} value={cond.value}>
                          {cond.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="manual-description">Description / Notes</Label>
                  <textarea
                    id="manual-description"
                    rows={3}
                    placeholder="Describe highlights, condition details, or included notes..."
                    {...manualForm.register("description")}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!isVerified}
                isLoading={listManuallyMutation.isPending}
                className="w-full font-bold shadow-lg"
              >
                <span>Publish Manual Listing</span>
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />
    </main>
  );
}
