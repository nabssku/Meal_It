"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function setupUserProfile(data: {
  gender: string;
  age: number;
  height: number;
  weight: number;
  bodyGoal: string;
  dailyBudget: number;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: Kamu harus login terlebih dahulu.");
  }

  // Validate number fields
  if (
    isNaN(data.age)    || data.age    <= 0 ||
    isNaN(data.height) || data.height <= 0 ||
    isNaN(data.weight) || data.weight <= 0 ||
    isNaN(data.dailyBudget) || data.dailyBudget < 40000
  ) {
    throw new Error(
      "Data tidak valid: pastikan umur, tinggi, berat diisi dengan benar, dan budget harian minimal Rp 40.000."
    );
  }

  try {
    // Use upsert: if the user row doesn't exist yet, create it.
    // This guards against the JWT token holding an ID whose DB row was
    // not yet committed (e.g. race condition on first sign-in).
    const updatedUser = await prisma.user.upsert({
      where: { id: session.user.id },
      update: {
        gender:      data.gender,
        age:         data.age,
        height:      data.height,
        weight:      data.weight,
        bodyGoal:    data.bodyGoal,
        dailyBudget: data.dailyBudget,
      },
      create: {
        id:          session.user.id,
        email:       session.user.email ?? undefined,
        name:        session.user.name  ?? undefined,
        image:       session.user.image ?? undefined,
        gender:      data.gender,
        age:         data.age,
        height:      data.height,
        weight:      data.weight,
        bodyGoal:    data.bodyGoal,
        dailyBudget: data.dailyBudget,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile");
    return updatedUser;
  } catch (error: any) {
    // Log the full Prisma error so we can debug it from the server console
    console.error("[setupUserProfile] error code   :", error?.code);
    console.error("[setupUserProfile] error message:", error?.message);
    console.error("[setupUserProfile] error meta   :", JSON.stringify(error?.meta));
    throw new Error(
      error?.code === "P2025"
        ? "Akun tidak ditemukan di database. Silakan logout dan login kembali."
        : error?.message ?? "Gagal menyimpan profil. Coba lagi."
    );
  }
}

export async function updateBudget(amount: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (isNaN(amount) || amount < 40000) throw new Error("Jumlah budget tidak boleh kurang dari Rp 40.000.");

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data:  { dailyBudget: amount },
  });

  revalidatePath("/profile/budget");
  revalidatePath("/dashboard");
  return updatedUser;
}

export async function updateDiet(data: { bodyGoal: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data:  { bodyGoal: data.bodyGoal },
  });

  revalidatePath("/profile/diet");
  return updatedUser;
}

export async function updatePreferences(data: {
  allergies:   string[];
  preferences: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      allergies:   data.allergies,
      preferences: data.preferences,
    },
  });

  revalidatePath("/profile/preferences");
  return updatedUser;
}

export async function getUserBudgetAction(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { dailyBudget: true },
  });

  return user?.dailyBudget ?? 50000;
}

export async function getUserPreferencesAction(): Promise<{ allergies: string[]; preferences: string[] }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      allergies: true,
      preferences: true,
    },
  });

  return {
    allergies: user?.allergies || [],
    preferences: user?.preferences || [],
  };
}

export async function getUserProfileAction(): Promise<{
  name: string | null;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, address: true, latitude: true, longitude: true },
  });
  return user || { name: "", email: "", address: "", latitude: null, longitude: null };
}

export async function updateUserProfileAction(data: { name: string; email: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      email: data.email,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/dashboard");
  return updatedUser;
}

export async function updateUserLocationAction(data: {
  address: string;
  latitude: number;
  longitude: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!data.address || isNaN(data.latitude) || isNaN(data.longitude)) {
    throw new Error("Data lokasi tidak valid.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/dashboard");
  return updatedUser;
}

export async function updatePhysicalStatsAction(data: {
  gender: string;
  age: number;
  height: number;
  weight: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      gender: data.gender,
      age: data.age,
      height: data.height,
      weight: data.weight,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/diet");
  revalidatePath("/dashboard");
  return updatedUser;
}

export async function getRecentUserActivitiesAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const todayPlan = await prisma.mealPlan.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        items: {
          include: {
            menu: {
              include: {
                vendor: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: {
        todayPlan: todayPlan
          ? {
              id: todayPlan.id,
              status: todayPlan.status,
              items: todayPlan.items.map((item) => ({
                id: item.id,
                status: item.status,
                menuName: item.menu.name,
                vendorName: item.menu?.vendor?.name || "Vendor",
                mealType: item.mealType,
              })),
            }
          : null,
      },
    };
  } catch (error: any) {
    console.error("[getRecentUserActivitiesAction] error:", error);
    return { success: false, error: error.message || "Gagal mengambil data aktivitas." };
  }
}

