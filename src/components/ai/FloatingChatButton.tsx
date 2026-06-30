"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

const HIDE_ON_PATHS = ["/ai-chat", "/", "/login", "/onboarding", "/profile-setup"];

export default function FloatingChatButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on specific pages and portal routes
  const shouldHide =
    HIDE_ON_PATHS.includes(pathname) ||
    pathname === "/vendor" ||
    pathname.startsWith("/vendor/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (shouldHide) return null;

  return (
    <>
      <button
        id="floating-ai-chat-btn"
        onClick={() => router.push("/ai-chat")}
        className="fixed z-40 flex items-center justify-center bottom-[90px] md:bottom-6 right-4 md:right-[calc(50vw-208px)] transition-transform active:scale-95 duration-200"
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0f5238 0%, #1a9e5c 100%)",
          boxShadow: "0 4px 20px rgba(15, 82, 56, 0.5), 0 0 0 0 rgba(34, 197, 94, 0.4)",
          animation: "floatPulse 2.5s ease-in-out infinite",
          border: "1.5px solid rgba(34, 197, 94, 0.35)",
        }}
        aria-label="Chat dengan MealIt AI"
        title="Chat dengan MealIt AI"
      >
        <Sparkles size={22} className="text-white" strokeWidth={1.8} />
      </button>

      <style jsx global>{`
        @keyframes floatPulse {
          0%, 100% {
            transform: translateY(0px);
            box-shadow: 0 4px 20px rgba(15, 82, 56, 0.5), 0 0 0 0 rgba(34, 197, 94, 0.4);
          }
          50% {
            transform: translateY(-4px);
            box-shadow: 0 8px 28px rgba(15, 82, 56, 0.6), 0 0 0 8px rgba(34, 197, 94, 0);
          }
        }
      `}</style>
    </>
  );
}
