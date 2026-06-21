"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdminMetrics() {
  const totalUsers = await prisma.user.count();
  const totalVendors = await prisma.vendor.count({ where: { isActive: true } });
  const totalMenus = await prisma.menu.count();
  const totalSubscriptions = await prisma.vendorSubscription.count({ where: { status: "ACTIVE" } });

  const activeSubscriptions = await prisma.vendorSubscription.findMany({
    where: { status: "ACTIVE" }
  });
  const totalRevenue = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  return {
    totalUsers,
    totalVendors,
    totalMenus,
    totalSubscriptions,
    totalRevenue,
  };
}

export async function getAdminVendors() {
  return await prisma.vendor.findMany({
    include: {
      user: {
        select: { email: true }
      },
      _count: {
        select: { menus: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function toggleVendorVerification(vendorId: string, currentStatus: boolean) {
  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: { isVerified: !currentStatus }
  });
  revalidatePath("/admin/dashboard");
  return updated;
}

export async function updateVendorPlan(vendorId: string, plan: string) {
  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: { 
      plan,
      subscriptionStatus: plan === "PREMIUM" ? "ACTIVE" : "INACTIVE",
      subscriptionExpiresAt: plan === "PREMIUM" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
    }
  });
  revalidatePath("/admin/dashboard");
  revalidatePath("/vendor/dashboard");
  return updated;
}

export async function deleteVendor(vendorId: string) {
  // First locate vendor userId
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { userId: true }
  });

  if (vendor) {
    // Revert role of user to "user"
    await prisma.user.update({
      where: { id: vendor.userId },
      data: { role: "user" }
    });
  }

  const deleted = await prisma.vendor.delete({
    where: { id: vendorId }
  });
  revalidatePath("/admin/dashboard");
  return deleted;
}

export async function getAdminUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function updateUserRole(userId: string, role: string) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  revalidatePath("/admin/dashboard");
  return updated;
}

export async function deleteUser(userId: string) {
  const deleted = await prisma.user.delete({
    where: { id: userId }
  });
  revalidatePath("/admin/dashboard");
  return deleted;
}

export async function getAdminMenus() {
  return await prisma.menu.findMany({
    include: {
      vendor: {
        select: { name: true }
      }
    },
    orderBy: { name: "asc" }
  });
}

export async function toggleMenuAvailability(menuId: string, currentStatus: boolean) {
  const updated = await prisma.menu.update({
    where: { id: menuId },
    data: { isAvailable: !currentStatus }
  });
  revalidatePath("/admin/dashboard");
  revalidatePath("/menus");
  return updated;
}

export async function deleteMenu(menuId: string) {
  const deleted = await prisma.menu.delete({
    where: { id: menuId }
  });
  revalidatePath("/admin/dashboard");
  revalidatePath("/menus");
  return deleted;
}

export async function getAdminUserAiPreferences() {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      bodyGoal: true,
      dailyBudget: true,
      allergies: true,
      preferences: true,
      gender: true,
      age: true,
      height: true,
      weight: true
    },
    orderBy: { name: "asc" }
  });
}

export async function updateUserAiPreferences(
  userId: string,
  data: {
    dailyBudget: number;
    bodyGoal: string;
    allergies: string[];
    preferences: string[];
  }
) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      dailyBudget: data.dailyBudget,
      bodyGoal: data.bodyGoal,
      allergies: data.allergies,
      preferences: data.preferences
    }
  });
  revalidatePath("/admin/dashboard");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return updated;
}
