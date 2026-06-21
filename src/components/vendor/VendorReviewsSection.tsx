import React from "react";
import { Star, MessageCircle, UserCircle2 } from "lucide-react";
import StarRating from "@/components/ui/StarRating";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface VendorReviewsSectionProps {
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
}

export default function VendorReviewsSection({
  reviews,
  avgRating,
  totalReviews,
}: VendorReviewsSectionProps) {
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      totalReviews > 0
        ? (reviews.filter((r) => r.rating === star).length / totalReviews) * 100
        : 0,
  }));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#191C1D]">Ulasan Pelanggan</h3>

      {totalReviews === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E1E3E4] p-8 flex flex-col items-center gap-3 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#F3F4F5] flex items-center justify-center text-[#AAADAA]">
            <MessageCircle size={28} />
          </div>
          <p className="text-sm font-semibold text-[#707973]">
            Belum ada ulasan masuk.
          </p>
          <p className="text-xs text-[#AAADAA]">
            Ulasan dari pelanggan akan muncul di sini.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Card */}
          <div className="bg-white rounded-3xl border border-[#E1E3E4] p-6 shadow-sm flex flex-col sm:flex-row gap-6">
            {/* Big Number */}
            <div className="flex flex-col items-center justify-center sm:w-32 flex-shrink-0">
              <span className="text-6xl font-black text-[#191C1D]">
                {avgRating.toFixed(1)}
              </span>
              <StarRating value={Math.round(avgRating)} readonly size={16} className="mt-2" />
              <span className="text-xs text-[#707973] mt-1 font-medium">
                {totalReviews} ulasan
              </span>
            </div>

            {/* Distribution Bars */}
            <div className="flex-1 flex flex-col gap-2 justify-center">
              {ratingDistribution.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#707973] w-4 text-right">
                    {star}
                  </span>
                  <Star size={12} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                  <div className="flex-1 h-2 bg-[#F3F4F5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#AAADAA] w-5 font-medium">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review List */}
          <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
            {reviews.slice(0, 5).map((review, idx) => (
              <div
                key={review.id}
                className={`p-5 flex gap-4 ${
                  idx !== 0 ? "border-t border-[#EDEEEF]" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F5238] to-[#2D6A4F] flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {review.user.image ? (
                    <img
                      src={review.user.image}
                      alt={review.user.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-black text-white">
                      {review.user.name?.substring(0, 2).toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[#191C1D]">
                        {review.user.name || "Pengguna"}
                      </p>
                      <StarRating value={review.rating} readonly size={13} className="mt-0.5" />
                    </div>
                    <span className="text-[10px] text-[#AAADAA] font-medium flex-shrink-0">
                      {new Date(review.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-[#404943] leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
