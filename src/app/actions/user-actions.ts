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
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      gender: data.gender,
      age: data.age,
      height: data.height,
      weight: data.weight,
      bodyGoal: data.bodyGoal,
      dailyBudget: data.dailyBudget,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return updatedUser;
}

export async function updateBudget(amount: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { dailyBudget: amount },
  });

  revalidatePath("/profile/budget");
  revalidatePath("/dashboard");
  return updatedUser;
}

export async function updateDiet(data: {
  bodyGoal: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { bodyGoal: data.bodyGoal },
  });

  revalidatePath("/profile/diet");
  return updatedUser;
}

export async function updatePreferences(data: {
  allergies: string[];
  preferences: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      allergies: data.allergies,
      preferences: data.preferences,
    },
  });

  revalidatePath("/profile/preferences");
  return updatedUser;
}
