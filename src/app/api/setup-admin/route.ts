import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// TEMPORARY endpoint to create admin account — DELETE AFTER USE
export async function GET() {
  const SECRET = "mealit-setup-2024";
  
  try {
    const password = await bcrypt.hash("Admin@Mealit123", 10);
    
    const existing = await prisma.user.findUnique({ 
      where: { email: "admin@mealit.com" } 
    });

    if (existing) {
      await prisma.user.update({
        where: { email: "admin@mealit.com" },
        data: { role: "admin", password, name: "Superadmin" },
      });
      return NextResponse.json({ 
        success: true, 
        message: "Admin updated",
        email: "admin@mealit.com",
        password: "Admin@Mealit123"
      });
    }

    await prisma.user.create({
      data: {
        email: "admin@mealit.com",
        name: "Superadmin",
        password,
        role: "admin",
        allergies: [],
        preferences: [],
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin created successfully!",
      email: "admin@mealit.com",
      password: "Admin@Mealit123",
      note: "DELETE this file after use: src/app/api/setup-admin/route.ts"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
