"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

  // Create user and vendor in a transaction
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: "vendor",
      },
    });

    const vendor = await tx.vendor.create({
      data: {
        userId: user.id,
        name: data.vendorName,
      },
    });

    return { user, vendor };
  });
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
}) {
  return await prisma.vendor.update({
    where: { id: data.vendorId },
    data,
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
