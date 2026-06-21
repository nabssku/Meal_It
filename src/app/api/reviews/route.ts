import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/reviews — upsert review (create or update if already reviewed)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { vendorId, rating, comment } = body;

  if (!vendorId || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "vendorId dan rating (1–5) wajib diisi" },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  // Upsert: update if exists, create if not
  const existingReview = await prisma.review.findFirst({
    where: { userId, vendorId },
  });

  let review;
  if (existingReview) {
    review = await prisma.review.update({
      where: { id: existingReview.id },
      data: { rating: Math.round(rating), comment: comment || null },
    });
  } else {
    review = await prisma.review.create({
      data: {
        userId,
        vendorId,
        rating: Math.round(rating),
        comment: comment || null,
      },
    });
  }

  // Recalculate average rating for the vendor
  const aggregate = await prisma.review.aggregate({
    where: { vendorId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avgRating = aggregate._avg.rating ?? 0;
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { rating: Math.round(avgRating * 10) / 10 }, // round to 1 decimal
  });

  return NextResponse.json({
    review,
    newAvgRating: Math.round(avgRating * 10) / 10,
    totalReviews: aggregate._count.rating,
  });
}
