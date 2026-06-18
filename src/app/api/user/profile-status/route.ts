import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ isProfileComplete: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { bodyGoal: true, age: true, height: true, weight: true },
    });

    // Profile is considered complete if bodyGoal, age, height, and weight are all set
    const isProfileComplete =
      !!user && !!user.bodyGoal && !!user.age && !!user.height && !!user.weight;

    return NextResponse.json({ isProfileComplete });
  } catch (error: any) {
    console.error("[/api/user/profile-status] Error:", error.message);
    // Return false so the profile-setup page is shown (safe fallback)
    return NextResponse.json({ isProfileComplete: false }, { status: 200 });
  }
}
