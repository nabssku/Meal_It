import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileSetupForm from "./ProfileSetupForm";

export default async function ProfileSetupPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has complete profile details in the database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const isProfileComplete =
    !!user && !!user.bodyGoal && !!user.age && !!user.height && !!user.weight;

  if (isProfileComplete) {
    redirect("/dashboard");
  }

  // Pass existing data if any (in case of partial fills)
  const initialData = user
    ? {
        gender: user.gender || undefined,
        age: user.age || undefined,
        height: user.height || undefined,
        weight: user.weight || undefined,
        bodyGoal: user.bodyGoal || undefined,
        dailyBudget: user.dailyBudget || undefined,
      }
    : undefined;

  return <ProfileSetupForm initialData={initialData} />;
}
