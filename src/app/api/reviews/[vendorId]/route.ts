import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reviews/[vendorId] — get all reviews for a vendor
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;

  if (!vendorId) {
    return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  const aggregate = await prisma.review.aggregate({
    where: { vendorId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return NextResponse.json({
    reviews,
    avgRating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
    totalReviews: aggregate._count.rating,
  });
}
