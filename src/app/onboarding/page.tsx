"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, HelpCircle, Wallet, Utensils, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const slides = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUFSFivGE0ATarmGgG3fHvf7jz8-NVMb-etU6_zIgC1w1h4Wp-bUmS6tsWXIQR5IM5Pei5_chJtEdjZhXVVR73te85vY7KQdmsc6K53e3Ozdz0JuFattUWP5s00jYD7cIC4UG4COuXwcyPWJsA3y2ZjHqnb5yQwbwqWZD2VD6KIIBGJZEcyWS-rbnKpt-gYzoa2tRYhG3PH83AQOyShrO5StcRPJCZO1R-VbB7YW5RKS3WLSV3hYRFwZRm0aPtid2ry8U3PE6QUCM",
    icon: HelpCircle,
    iconBg: "bg-[#FD761A]",
    title: "Bingung makan apa hari ini?",
    desc: "Temukan ribuan ide menu lezat yang pas dengan kantong dan seleramu setiap harinya.",
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXq88kZxfrC_o6UCMtstf4LHXLXzxlqPxCq1P7pk6AFJMzMOU2dyVipepnKjzEqYDzhTwUXPLiAUb3MUz9eOg58aNqVTkZF0UvHkSABB6hY4ekqN6URvKd9VRMjxpS3gToe5uPnfFVGZfTJcBgiGq6obsL_ikJMaZ2ZHmxfS9_R4EKTMSvMoESVuE9qN_7JVlwY9rQiwN4G_xhPhxMTIOk2FFEcZsOTmfAAuTYl0uvJN6QuwfSsMPEbS6gg19a2596SatQNKPELOA",
    icon: Wallet,
    iconBg: "bg-[#006E2F]",
    title: "Atur budget makanmu",
    desc: "Tetapkan limit harian agar pengeluaran tetap terkontrol tanpa mengurangi kenikmatan makan.",
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDByWV6M1m3wW8QD0Z4z11MRYK5swRD2aK3cyH4hw80gBYQ2P5VFWEZFT-QnsKv8RoqPflOIjKl-v7zBKizHErOZKCfO98DtUe-FIz4Z2GrObeUAdAkv6A1Imzkn25-XEDbBa0t6fUUtj7fh9pb9jTX5xf0rX6h_wfu23rPG2bUJnUohtY-r55z7NjSEHR6gOOY1-knsjHzjGddfPPhypqU8zBHv2JHH4w_wrHzR2kMc0sWpMBdu3uV1wVlpjS1CqjVETuorsWU7l0",
    icon: Utensils,
    iconBg: "bg-[#36B6FB]",
    title: "Makan sehat jadi lebih praktis",
    desc: "Rencanakan nutrisi mingguanmu secara otomatis dan nikmati hidup lebih berkualitas.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role;
      if (role) {
        if (role === "vendor") {
          router.push("/vendor/dashboard");
        } else if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    }
  }, [status, session, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="fixed inset-0 bg-surface flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  const nextSlide = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      router.push("/login");
    }
  };

  const skipSlide = () => {
    setCurrent(slides.length - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      if (current < slides.length - 1) setCurrent(current + 1);
    } else if (diff < -50) {
      if (current > 0) setCurrent(current - 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-surface flex flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel Container */}
      <div 
        className="flex-1 flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <section key={index} className="w-full flex-shrink-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-sm flex flex-col items-center">
              {/* Illustration Container */}
              <div className="relative w-64 h-64 md:w-72 md:h-72 mb-10 rounded-[40px] shadow-2xl bg-white flex items-center justify-center p-6 border border-black/5">
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="w-full h-full object-cover rounded-[20px]"
                />
                <div className={cn(
                  "absolute p-4 rounded-full shadow-lg text-white",
                  index === 0 ? "-top-4 -right-4" : index === 1 ? "-bottom-4 -left-4" : "-top-4 -left-4",
                  slide.iconBg
                )}>
                  <slide.icon size={28} />
                </div>
              </div>

              {/* Text Content */}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 px-2 leading-tight">
                {slide.title}
              </h1>
              <p className="text-base text-muted-foreground px-6 leading-relaxed">
                {slide.desc}
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="p-8 pb-12 flex flex-col items-center gap-8 bg-gradient-to-t from-surface to-transparent">
        {/* Indicators */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === current ? "w-6 bg-primary" : "w-2 bg-border"
              )}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm flex items-center justify-between">
          <button 
            onClick={skipSlide}
            className={cn(
              "text-sm font-semibold text-muted-foreground px-6 py-2 hover:bg-muted rounded-xl transition-all",
              current === slides.length - 1 && "opacity-0 pointer-events-none"
            )}
          >
            Lewati
          </button>
          
          <button 
            onClick={nextSlide}
            className={cn(
              "flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white shadow-lg active:scale-95 transition-all duration-200",
              current === slides.length - 1 ? "bg-[#FD761A]" : "bg-primary"
            )}
          >
            <span>{current === slides.length - 1 ? "Mulai Sekarang" : "Lanjut"}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
