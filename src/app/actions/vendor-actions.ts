"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkAndUpdateMealPlanStatus } from "./meal-actions";

export async function registerVendor(data: {
  email: string;
  name: string;
  vendorName: string;
  password?: string;
}) {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Account with this email already exists");
  }

  // Hash password if provided
  let hashedPassword = undefined;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 10);
  }

  // Sequential creates with manual cleanup (PrismaNeonHttp doesn't support interactive transactions)
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: "vendor",
      allergies: [],
      preferences: [],
    },
  });

  let vendor;
  try {
    vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        name: data.vendorName,
      },
    });
  } catch (vendorError) {
    // Rollback: delete the created user on vendor creation failure
    await prisma.user.delete({ where: { id: user.id } }).catch(() => { });
    throw vendorError;
  }

  return { user, vendor };
}

export async function updateVendorProfile(data: {
  vendorId: string;
  name?: string;
  description?: string;
  logo?: string;
  address?: string;
  city?: string;
  openingHours?: string;
  contact?: string;
  category?: string;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
  pakasirSlug?: string;
  pakasirApiKey?: string;
  deliveryFee?: number;
  isDeliveryEnabled?: boolean;
  deliveryRadius?: number;
}) {
  const { vendorId, ...updateData } = data;
  return await prisma.vendor.update({
    where: { id: vendorId },
    data: updateData,
  });
}

export async function addMenuItem(data: {
  vendorId: string;
  name: string;
  description?: string;
  price: number;
  calories: number;
  protein: number;
  fat?: number;
  carbs?: number;
  image?: string;
  category?: string;
  stock?: number;
  tags?: string[];
}) {
  // Check if vendor plan is FREE and already has >= 5 menus
  const vendor = await prisma.vendor.findUnique({
    where: { id: data.vendorId },
    select: { plan: true },
  });

  if (!vendor || vendor.plan === "FREE") {
    const menuCount = await prisma.menu.count({
      where: { vendorId: data.vendorId },
    });
    if (menuCount >= 5) {
      throw new Error(
        "Batas Menu Tercapai: Paket FREE hanya mengizinkan maksimal 5 menu. Silakan upgrade ke paket PREMIUM untuk menambahkan menu tanpa batas!"
      );
    }
  }

  return await prisma.menu.create({
    data: {
      ...data,
    },
  });
}

export async function updateMenuItem(id: string, data: Partial<{
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  image: string;
  category: string;
  stock: number;
  isAvailable: boolean;
  tags: string[];
}>) {
  return await prisma.menu.update({
    where: { id },
    data,
  });
}

export async function deleteMenuItem(id: string) {
  return await prisma.menu.delete({
    where: { id },
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}

export async function updateMealPlanItemStatusAction(itemId: string, status: string) {
  const updated = await prisma.mealPlanItem.update({
    where: { id: itemId },
    data: { 
      status,
      ...(status === "PICKED_UP" || status === "DELIVERED" ? { paymentStatus: "PAID" } : {})
    },
  });

  if (updated.mealPlanId) {
    await checkAndUpdateMealPlanStatus(updated.mealPlanId);
  }
  
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/vendor/orders");
  revalidatePath("/vendor/schedule");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return updated;
}

export async function createAdvertisementAction(data: {
  vendorId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: data.vendorId },
    select: { plan: true },
  });

  if (!vendor || vendor.plan !== "PREMIUM") {
    throw new Error("Akses Ditolak: Hanya vendor dengan paket PREMIUM yang dapat memasang iklan.");
  }

  const ad = await prisma.advertisement.create({
    data,
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/dashboard");
  revalidatePath("/vendor/advertisements");
  return ad;
}

export async function updateAdvertisementAction(
  adId: string,
  data: Partial<{
    title: string;
    description: string;
    imageUrl: string;
    targetUrl: string;
    isActive: boolean;
  }>
) {
  const ad = await prisma.advertisement.update({
    where: { id: adId },
    data,
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/dashboard");
  revalidatePath("/vendor/advertisements");
  return ad;
}

export async function deleteAdvertisementAction(adId: string) {
  const ad = await prisma.advertisement.delete({
    where: { id: adId },
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/dashboard");
  revalidatePath("/vendor/advertisements");
  return ad;
}

export async function submitReview(data: {
  userId: string;
  vendorId: string;
  rating: number;
  comment?: string;
}) {
  const { userId, vendorId, rating, comment } = data;

  if (!vendorId || !userId || rating < 1 || rating > 5) {
    throw new Error("Data review tidak valid");
  }

  // Upsert: update if exists, create otherwise
  const existing = await prisma.review.findFirst({ where: { userId, vendorId } });

  let review;
  if (existing) {
    review = await prisma.review.update({
      where: { id: existing.id },
      data: { rating: Math.round(rating), comment: comment || null },
    });
  } else {
    review = await prisma.review.create({
      data: { userId, vendorId, rating: Math.round(rating), comment: comment || null },
    });
  }

  // Recalculate vendor average rating
  const aggregate = await prisma.review.aggregate({
    where: { vendorId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avgRating = Math.round((aggregate._avg.rating ?? 0) * 10) / 10;
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { rating: avgRating },
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/vendors");
  revalidatePath("/vendor/dashboard");

  return { review, newAvgRating: avgRating, totalReviews: aggregate._count.rating };
}

export async function getVendorReviews(vendorId: string) {
  const reviews = await prisma.review.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  const aggregate = await prisma.review.aggregate({
    where: { vendorId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    reviews,
    avgRating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
    totalReviews: aggregate._count.rating,
  };
}
