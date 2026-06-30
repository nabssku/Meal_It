import React from "react";
import Link from "next/link";
import { 
  User as UserIcon, 
  Shield, 
  ChevronRight, 
  Bell, 
  Settings, 
  LogOut, 
  Heart, 
  Wallet,
  MapPin,
  AlertCircle,
  Calendar as CalendarIcon
} from "lucide-react";
import Button from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PwaInstallButton from "@/components/profile/PwaInstallButton";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
  } catch (error) {
    console.error("[ProfilePage] DB error:", error);
  }

  if (!user) {
    redirect("/profile-setup");
  }

  // Translate bodyGoal to Indonesian labels
  const bodyGoalLabels: Record<string, string> = {
    weight_loss: "Turun Berat",
    muscle_gain: "Tambah Otot",
    healthy_life: "Hidup Sehat",
    budget_healthy: "Hemat Sehat",
    maintaining: "Menjaga Berat",
  };
  const targetLabel = bodyGoalLabels[user.bodyGoal || ""] || "Hidup Sehat";

  // Calculate BMI dynamically
  let bmiValueStr = "-";
  let bmiCategory = "Unknown";
  let bmiColor = "text-muted-foreground";

  if (user.weight && user.height) {
    const heightInMeters = user.height / 100;
    const bmi = user.weight / (heightInMeters * heightInMeters);
    bmiValueStr = bmi.toFixed(1);
    if (bmi < 18.5) {
      bmiCategory = "Kurang";
      bmiColor = "text-yellow-600";
    } else if (bmi >= 18.5 && bmi < 25) {
      bmiCategory = "Ideal";
      bmiColor = "text-green-600";
    } else if (bmi >= 25 && bmi < 30) {
      bmiCategory = "Berlebih";
      bmiColor = "text-orange-500";
    } else {
      bmiCategory = "Obesitas";
      bmiColor = "text-red-600";
    }
  }

  // Calculate Streak count (consecutive days of completed meal plans)
  let streakCount = 0;
  try {
    const completedPlans = await prisma.mealPlan.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
      select: {
        date: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    if (completedPlans.length > 0) {
      // Normalize dates to YYYY-MM-DD to handle unique days correctly
      const completedDates = Array.from(
        new Set(
          completedPlans.map((plan) => {
            const d = new Date(plan.date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          })
        )
      );

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const formatDateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const todayStr = formatDateString(today);
      const yesterdayStr = formatDateString(yesterday);

      // Check if user completed a plan today OR yesterday
      const hasCompletedToday = completedDates.includes(todayStr);
      const hasCompletedYesterday = completedDates.includes(yesterdayStr);

      if (hasCompletedToday || hasCompletedYesterday) {
        const checkDate = hasCompletedToday ? today : yesterday;
        let checkStr = formatDateString(checkDate);

        while (completedDates.includes(checkStr)) {
          streakCount++;
          // Move to previous day
          checkDate.setDate(checkDate.getDate() - 1);
          checkStr = formatDateString(checkDate);
        }
      }
    }
  } catch (error) {
    console.error("[ProfilePage] Streak calculation error:", error);
  }

  const plannerPeriodLabels: Record<string, string> = {
    daily: "Harian",
    weekly: "Mingguan",
    monthly: "Bulanan",
  };
  const activePlannerPeriod = plannerPeriodLabels[user.plannerPeriod || ""] || "Harian";

  const menuItems = [
    { icon: UserIcon, label: "Detail Profil", sub: "Atur informasi pribadimu", href: "/profile/edit" },
    { icon: MapPin, label: "Lokasi Rumah/Kost", sub: "Atur alamat & koordinat tinggal", href: "/profile/location" },
    { icon: Shield, label: "Preferensi Diet", sub: "Target kalori, protein, dan goal", href: "/profile/diet" },
    { icon: Wallet, label: "Budget & Dompet", sub: "Atur batas pengeluaran harian", href: "/profile/budget" },
    { icon: CalendarIcon, label: "Periode Planner", sub: `Planner Aktif: ${activePlannerPeriod}`, href: "/profile/planner" },
    { icon: Heart, label: "Preferensi & Alergi", sub: "Pantangan dan makanan favorit", href: "/profile/preferences" },
    { icon: Bell, label: "Notifikasi", sub: "Atur pengingat makan", href: "/profile/notifications" },
    { icon: Settings, label: "Pengaturan", sub: "Keamanan dan data", href: "/profile/settings" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col items-center gap-4 pt-10 text-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-white shadow-lg overflow-hidden">
            <img 
              src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=128&background=0F5238&color=fff`} 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 p-1.5 bg-green-500 text-white rounded-full border-2 border-white">
             <Shield size={12} strokeWidth={3} />
          </div>
        </div>
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold text-foreground">{user.name || "Sobat Mealit"}</h1>
            <p className="text-sm text-muted-foreground italic mb-1">&ldquo;Hidup sehat, dompet selamat&rdquo;</p>
            {user.address ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F5238]/5 text-[#0F5238] rounded-full text-[11px] font-semibold max-w-[280px]">
                <MapPin size={12} className="flex-shrink-0" />
                <span className="truncate">{user.address}</span>
              </div>
            ) : (
              <Link href="/profile/location" className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-full text-[11px] font-bold transition-colors">
                <AlertCircle size={12} />
                <span>Atur Lokasi Rumah/Kost</span>
              </Link>
            )}
        </div>
      </header>

      {/* Health Badge Section */}
      <section className="bg-primary/5 rounded-2xl p-4 flex justify-around items-center border border-primary/10 mx-4">
         <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Target</span>
            <span className="text-sm font-bold text-primary">{targetLabel}</span>
         </div>
         <div className="w-px h-8 bg-border/50" />
         <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">BMI</span>
            <span className={`text-sm font-bold ${bmiColor}`}>
              {bmiValueStr} {bmiCategory !== "Unknown" ? `(${bmiCategory})` : ""}
            </span>
         </div>
         <div className="w-px h-8 bg-border/50" />
         <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Streak</span>
            <span className="text-sm font-bold text-orange-500">{streakCount} Hari</span>
         </div>
      </section>

      {/* PWA Installation Promotion */}
      <PwaInstallButton />

      {/* Profile Menu */}
      <section className="flex flex-col gap-1 px-4">
        {menuItems.map((item, i) => (
          <Link 
            key={i} 
            href={item.href}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-all group"
          >
             <div className="p-2.5 bg-muted rounded-xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <item.icon size={20} />
             </div>
             <div className="flex-1 text-left flex flex-col">
                <span className="text-sm font-bold text-foreground">{item.label}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{item.sub}</span>
             </div>
             <ChevronRight size={18} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </section>

      <section className="mt-4 px-6">
        <Link href="/logout?callbackUrl=/login" className="block">
          <Button 
            type="button"
            variant="outline" 
            size="full" 
            className="border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 font-bold flex gap-2 rounded-xl h-14"
          >
              <LogOut size={18} />
              Keluar Aplikasi
          </Button>
        </Link>
        <p className="text-[10px] text-center text-muted-foreground mt-8 uppercase tracking-widest font-bold opacity-30">
          MEALIT v1.0.0 (Alpha)
        </p>
      </section>
    </div>
  );
}

