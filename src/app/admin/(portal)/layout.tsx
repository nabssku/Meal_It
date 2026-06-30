import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminLayoutClient } from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  });

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <AdminLayoutClient
      userName={user.name || "Administrator"}
      userEmail={user.email || ""}
    >
      {children}
    </AdminLayoutClient>
  );
}
