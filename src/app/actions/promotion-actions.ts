"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getPromotionsAction(vendorId: string) {
  return await prisma.promotion.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPromotionAction(data: {
  vendorId: string;
  title: string;
  code: string;
  description?: string;
  discountType: string;
  discountRate?: number;
  discountAmount?: number;
  maxUsageTotal?: number;
  maxUsagePerUser?: number;
  startDate?: string;
  endDate?: string;
  applicableDays?: string[];
  targetUserType?: string;
  isActive?: boolean;
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: data.vendorId },
    select: { plan: true },
  });

  if (!vendor || vendor.plan !== "PREMIUM") {
    throw new Error("Akses Ditolak: Hanya vendor dengan paket PREMIUM yang dapat membuat promo.");
  }

  const cleanCode = data.code.toUpperCase().trim();

  // Check unique promo code for this vendor
  const existing = await prisma.promotion.findFirst({
    where: {
      vendorId: data.vendorId,
      code: cleanCode,
    },
  });

  if (existing) {
    throw new Error("Kode promo ini sudah digunakan oleh toko Anda. Silakan buat kode lain.");
  }

  const promo = await prisma.promotion.create({
    data: {
      vendorId: data.vendorId,
      title: data.title,
      code: cleanCode,
      description: data.description || null,
      discountType: data.discountType,
      discountRate: data.discountType === "PERCENTAGE" ? Number(data.discountRate || 0) : null,
      discountAmount: data.discountType === "FLAT" ? Number(data.discountAmount || 0) : null,
      maxUsageTotal: data.maxUsageTotal ? Number(data.maxUsageTotal) : null,
      maxUsagePerUser: data.maxUsagePerUser ? Number(data.maxUsagePerUser) : null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      applicableDays: data.applicableDays || [],
      targetUserType: data.targetUserType || "ALL",
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });

  revalidatePath("/vendor/promotions");
  return promo;
}

export async function updatePromotionAction(
  id: string,
  data: Partial<{
    title: string;
    code: string;
    description: string;
    discountType: string;
    discountRate: number;
    discountAmount: number;
    maxUsageTotal: number;
    maxUsagePerUser: number;
    startDate: string;
    endDate: string;
    applicableDays: string[];
    targetUserType: string;
    isActive: boolean;
  }>
) {
  const promo = await prisma.promotion.findUnique({
    where: { id },
    include: { vendor: { select: { plan: true } } },
  });

  if (!promo) {
    throw new Error("Promo tidak ditemukan.");
  }

  if (promo.vendor.plan !== "PREMIUM") {
    throw new Error("Akses Ditolak: Hanya vendor dengan paket PREMIUM yang dapat mengedit promo.");
  }

  let cleanCode = undefined;
  if (data.code) {
    cleanCode = data.code.toUpperCase().trim();
    if (cleanCode !== promo.code) {
      const existing = await prisma.promotion.findFirst({
        where: {
          vendorId: promo.vendorId,
          code: cleanCode,
        },
      });
      if (existing) {
        throw new Error("Kode promo ini sudah digunakan oleh toko Anda.");
      }
    }
  }

  const updated = await prisma.promotion.update({
    where: { id },
    data: {
      title: data.title,
      code: cleanCode,
      description: data.description !== undefined ? data.description : undefined,
      discountType: data.discountType,
      discountRate: data.discountType === "PERCENTAGE" ? Number(data.discountRate || 0) : undefined,
      discountAmount: data.discountType === "FLAT" ? Number(data.discountAmount || 0) : undefined,
      maxUsageTotal: data.maxUsageTotal !== undefined ? (data.maxUsageTotal ? Number(data.maxUsageTotal) : null) : undefined,
      maxUsagePerUser: data.maxUsagePerUser !== undefined ? (data.maxUsagePerUser ? Number(data.maxUsagePerUser) : null) : undefined,
      startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
      endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
      applicableDays: data.applicableDays,
      targetUserType: data.targetUserType,
      isActive: data.isActive,
    },
  });

  revalidatePath("/vendor/promotions");
  return updated;
}

export async function deletePromotionAction(id: string) {
  const promo = await prisma.promotion.delete({
    where: { id },
  });
  revalidatePath("/vendor/promotions");
  return promo;
}

export async function validatePromoAction(
  code: string,
  vendorId: string,
  totalAmount: number
): Promise<{
  success: boolean;
  error?: string;
  promoId?: string;
  code?: string;
  discountAmount?: number;
  title?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Kamu harus login terlebih dahulu." };
    }
    const userId = session.user.id;

    if (!code || !vendorId) {
      return { success: false, error: "Kode promo atau Vendor tidak valid." };
    }

    const cleanCode = code.toUpperCase().trim();

    const promo = await prisma.promotion.findFirst({
      where: {
        vendorId,
        code: cleanCode,
      },
      include: {
        vendor: { select: { plan: true } },
      },
    });

    if (!promo) {
      return { success: false, error: "Kode promo tidak ditemukan untuk toko ini." };
    }

    if (!promo.isActive) {
      return { success: false, error: "Promo ini sudah tidak aktif." };
    }

    if (promo.vendor.plan !== "PREMIUM") {
      return { success: false, error: "Promo tidak dapat digunakan karena toko saat ini tidak aktif di paket Premium." };
    }

    const now = new Date();

    // Date validity checks
    if (promo.startDate) {
      const start = new Date(promo.startDate);
      start.setHours(0, 0, 0, 0);
      if (now < start) {
        return { success: false, error: "Promo ini belum dimulai." };
      }
    }

    if (promo.endDate) {
      const end = new Date(promo.endDate);
      end.setHours(23, 59, 59, 999);
      if (now > end) {
        return { success: false, error: "Promo ini sudah kedaluwarsa." };
      }
    }

    // Days limit checks
    if (promo.applicableDays && promo.applicableDays.length > 0) {
      const daysEnglish = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDayEng = daysEnglish[now.getDay()];

      const dayMap: Record<string, string> = {
        "Senin": "Monday", "Selasa": "Tuesday", "Rabu": "Wednesday", "Kamis": "Thursday",
        "Jumat": "Friday", "Sabtu": "Saturday", "Minggu": "Sunday",
        "Monday": "Monday", "Tuesday": "Tuesday", "Wednesday": "Wednesday", "Thursday": "Thursday",
        "Friday": "Friday", "Saturday": "Saturday", "Sunday": "Sunday"
      };

      const currentDayNormalized = dayMap[currentDayEng];
      const matched = promo.applicableDays.some((day) => {
        const mapped = dayMap[day] || day;
        return mapped === currentDayNormalized;
      });

      if (!matched) {
        const translateToIndo: Record<string, string> = {
          "Monday": "Senin", "Tuesday": "Selasa", "Wednesday": "Rabu", "Thursday": "Kamis",
          "Friday": "Jumat", "Saturday": "Sabtu", "Sunday": "Minggu"
        };
        const currentIndo = translateToIndo[currentDayNormalized] || currentDayNormalized;
        return {
          success: false,
          error: `Promo ini tidak dapat digunakan pada hari ${currentIndo}.`,
        };
      }
    }

    // Limit usage checks
    // 1. Total usage
    if (promo.maxUsageTotal !== null) {
      const totalUsed = await prisma.order.count({
        where: {
          promoId: promo.id,
          status: { notIn: ["CANCELLED", "REJECTED"] },
        },
      });
      if (totalUsed >= promo.maxUsageTotal) {
        return { success: false, error: "Batas total kuota promo ini sudah habis." };
      }
    }

    // 2. Per user usage
    if (promo.maxUsagePerUser !== null) {
      const userUsed = await prisma.order.count({
        where: {
          userId,
          promoId: promo.id,
          status: { notIn: ["CANCELLED", "REJECTED"] },
        },
      });
      if (userUsed >= promo.maxUsagePerUser) {
        return {
          success: false,
          error: `Kamu telah mencapai batas penggunaan promo ini (${promo.maxUsagePerUser} kali).`,
        };
      }
    }

    // 3. New vs Old User condition
    if (promo.targetUserType === "NEW") {
      const userOrderCount = await prisma.order.count({
        where: {
          userId,
          status: { notIn: ["CANCELLED", "REJECTED"] },
        },
      });
      if (userOrderCount > 0) {
        return { success: false, error: "Promo ini khusus untuk Pengguna Baru." };
      }
    } else if (promo.targetUserType === "OLD") {
      const userOrderCount = await prisma.order.count({
        where: {
          userId,
          status: { notIn: ["CANCELLED", "REJECTED"] },
        },
      });
      if (userOrderCount === 0) {
        return { success: false, error: "Promo ini khusus untuk pelanggan yang sudah pernah melakukan pemesanan." };
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promo.discountType === "PERCENTAGE") {
      const rate = promo.discountRate || 0;
      discountAmount = Math.round(totalAmount * (rate / 100));
    } else {
      discountAmount = promo.discountAmount || 0;
    }

    // Cap the discount
    discountAmount = Math.min(discountAmount, totalAmount);

    return {
      success: true,
      promoId: promo.id,
      code: promo.code,
      discountAmount,
      title: promo.title,
    };
  } catch (err: any) {
    return { success: false, error: `Gagal memvalidasi promo: ${err.message}` };
  }
}
