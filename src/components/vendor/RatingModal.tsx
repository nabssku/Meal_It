"use client";

import React, { useState, useTransition } from "react";
import StarRating from "@/components/ui/StarRating";
import { submitReview } from "@/app/actions/vendor-actions";
import { X, MessageSquare, Send, CheckCircle2, Loader2 } from "lucide-react";

interface RatingModalProps {
  vendor: {
    id: string;
    name: string;
    category?: string | null;
    rating: number;
  };
  userId: string;
  onClose: () => void;
  existingRating?: number;
  existingComment?: string;
}

export default function RatingModal({
  vendor,
  userId,
  onClose,
  existingRating = 0,
  existingComment = "",
}: RatingModalProps) {
  const [rating, setRating] = useState(existingRating);
  const [comment, setComment] = useState(existingComment);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const ratingLabels: Record<number, string> = {
    1: "Sangat Buruk 😞",
    2: "Buruk 😕",
    3: "Cukup 😐",
    4: "Bagus 😊",
    5: "Luar Biasa! 🤩",
  };

  const handleSubmit = () => {
    if (rating === 0) {
      setError("Pilih minimal 1 bintang dulu ya!");
      return;
    }
    setError("");

    startTransition(async () => {
      try {
        await submitReview({ userId, vendorId: vendor.id, rating, comment });
        setSubmitted(true);
      } catch (err: any) {
        setError(err?.message || "Gagal mengirim rating. Coba lagi.");
      }
    });
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal Sheet */}
      <div className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0F5238] to-[#2D6A4F] p-6 pb-8">
          <button
            id="close-rating-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <X size={16} />
          </button>
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">
            Beri Ulasan
          </p>
          <h2 className="text-xl font-black text-white">{vendor.name}</h2>
          {vendor.category && (
            <p className="text-sm text-white/70 mt-0.5">{vendor.category}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 pb-10 sm:pb-6 flex flex-col gap-6">
          {submitted ? (
            /* Success State */
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#191C1D]">
                  Rating Terkirim! 🎉
                </h3>
                <p className="text-sm text-[#707973] mt-1">
                  Terima kasih sudah memberikan ulasan untuk{" "}
                  <strong>{vendor.name}</strong>.
                </p>
              </div>
              <button
                id="close-rating-success"
                onClick={onClose}
                className="mt-2 w-full bg-[#0F5238] hover:bg-[#0d4530] text-white font-bold py-3 rounded-2xl transition-colors"
              >
                Tutup
              </button>
            </div>
          ) : (
            <>
              {/* Star Picker */}
              <div className="flex flex-col items-center gap-3">
                <StarRating
                  value={rating}
                  onChange={setRating}
                  size={40}
                  className="justify-center"
                />
                <p
                  className={`text-sm font-bold transition-all ${
                    rating > 0 ? "text-amber-500 opacity-100" : "text-transparent opacity-0"
                  }`}
                >
                  {ratingLabels[rating] || ""}
                </p>
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#404943] uppercase tracking-wider">
                  <MessageSquare size={14} />
                  Komentar (Opsional)
                </label>
                <textarea
                  id="rating-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalamanmu dengan vendor ini..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-3 bg-[#F3F4F5] border border-transparent rounded-2xl text-sm text-[#191C1D] placeholder:text-[#AAADAA] focus:outline-none focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 resize-none transition-all"
                />
                <p className="text-[10px] text-[#AAADAA] text-right">
                  {comment.length}/300
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-2 rounded-xl text-center">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                id="submit-rating-btn"
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-[#0F5238] hover:bg-[#0d4530] disabled:bg-[#0F5238]/50 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-[#0F5238]/20"
              >
                {isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Kirim Rating
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
