"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(data: {
  email: string;
  name?: string;
  password?: string;
}) {
  if (!data.email) {
    throw new Error("Email wajib diisi.");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email sudah terdaftar. Silakan login.");
  }

  if (!data.password) {
    throw new Error("Password wajib diisi.");
  }

  if (data.password.length < 8) {
    throw new Error("Password harus minimal 8 karakter.");
  }

  const hasLetter = /[a-zA-Z]/.test(data.password);
  const hasNumber = /[0-9]/.test(data.password);
  if (!hasLetter || !hasNumber) {
    throw new Error("Password harus mengandung kombinasi huruf dan angka.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email:       data.email,
      name:        data.name ?? null,
      password:    hashedPassword,
      role:        "user",
      allergies:   [],
      preferences: [],
    },
  });

  return { id: user.id, email: user.email, name: user.name };
}
