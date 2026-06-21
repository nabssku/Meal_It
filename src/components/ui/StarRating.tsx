"use client";

import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 24,
  className = "",
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState(0);

  const displayValue = hovered > 0 ? hovered : value;

  return (
    <div
      id="star-rating"
      className={`flex gap-1 ${className}`}
      onMouseLeave={() => !readonly && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
            aria-label={`Rating ${star} bintang`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300"
              } ${!readonly && hovered >= star ? "text-amber-300 fill-amber-300" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}
