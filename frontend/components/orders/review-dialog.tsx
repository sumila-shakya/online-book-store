"use client";

import React, { useState } from "react";
import { Star, Loader2, AlertCircle } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { useSubmitReviewMutation } from "../../hooks/use-orders";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  revieweeId: number;
  revieweeName: string;
  isBuyerRole: boolean; // if current user is buyer, they are reviewing seller
}

export function ReviewDialog({
  isOpen,
  onClose,
  orderId,
  revieweeId,
  revieweeName,
  isBuyerRole,
}: ReviewDialogProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reviewMutation = useSubmitReviewMutation(isBuyerRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (rating < 1 || rating > 5) {
      setErrorMsg("Please select a rating between 1 and 5 stars.");
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        orderId,
        payload: {
          revieweeId,
          rating,
        },
      });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to submit rating.";
      setErrorMsg(msg);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Rate your experience with ${revieweeName}`}
      description={
        isBuyerRole
          ? "How was your experience purchasing from this seller?"
          : "How was your experience selling to this buyer?"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-2 py-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating !== null ? hoverRating : rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-hidden"
                >
                  <Star
                    className={`h-9 w-9 ${
                      active
                        ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                        : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={reviewMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={reviewMutation.isPending}
          >
            {reviewMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
