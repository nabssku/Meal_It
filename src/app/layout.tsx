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

export const viewport = {
  themeColor: "#0F5238",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Meal It - Healthy & Affordable AI Meal Planner",
  description: "Plan your meals intelligently with AI while staying on budget.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Meal It",
  },
  openGraph: {
    title: "Meal It - Healthy & Affordable AI Meal Planner",
    description: "Plan your meals intelligently with AI while staying on budget.",
    url: "https://mealit.vercel.app",
    siteName: "Meal It",
    images: [
      {
        url: "https://mealit.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Meal It - AI Meal Planner",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meal It - Healthy & Affordable AI Meal Planner",
    description: "Plan your meals intelligently with AI while staying on budget.",
    images: ["https://mealit.vercel.app/og-image.png"],
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

