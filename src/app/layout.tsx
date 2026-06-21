import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { Providers } from "@/components/providers/Providers";
import NotificationWatcher from "@/components/notifications/NotificationWatcher";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Meal It - Healthy & Affordable AI Meal Planner",
  description: "Plan your meals intelligently with AI while staying on budget.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>
          <NotificationWatcher />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

