"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SplashScreen() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setAnimationComplete(true);
          }, 500);
          return 100;
        }
        return prev + 100 / 30; // Approx 3 seconds
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (animationComplete && status !== "loading") {
      if (status === "authenticated" && session?.user) {
        const role = (session.user as any).role;
        if (role === "vendor") {
          router.push("/vendor/dashboard");
        } else if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/onboarding");
      }
    }
  }, [animationComplete, status, session, router]);

  return (
    <main className="splash-bg fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-warning/10 rounded-full blur-3xl"></div>
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center text-center fade-in">
        {/* Logo Container */}
        <div className="mb-8 drop-shadow-2xl">
          <div className="w-40 h-40 md:w-56 md:h-56 bg-white rounded-3xl shadow-lg flex items-center justify-center p-6 border border-black/5">
            <img
              src="/logo.png"
              alt="MEALIT Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <p className="text-3xl md:text-5xl font-extrabold text-primary tracking-tighter">
            MEALIT
          </p>
          <h1 className="text-lg md:text-xl font-medium text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
            Makan sehat, budget tetap irit.
          </h1>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="absolute bottom-20 w-full max-w-[200px] px-4">
        <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="mt-3 text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
          Loading...
        </p>
      </div>

      {/* Micro-interaction footer */}
      <footer className="absolute bottom-6 text-center">
        <ChevronDown className="text-primary animate-bounce w-6 h-6" />
      </footer>
    </main>
  );
}
