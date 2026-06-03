import React from "react";
import StatCard from "@/components/cards/StatCard";
import MealPlanCard from "@/components/cards/MealPlanCard";
import Button from "@/components/ui/Button";
import { Wallet, Flame, Target, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface MealItem {
  mealType: string;
  menu: {
    name: string;
    calories: number;
    protein: number;
    price: number;
    image: string | null;
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      mealPlans: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0,0,0,0)),
            lt: new Date(new Date().setHours(23,59,59,999))
          }
        },
        include: {
          items: {
            include: {
              menu: true
            }
          }
        }
      }
    }
  });

  if (!user) return null;

  const todayPlan = user.mealPlans[0];
  const todayMeals = todayPlan?.items.map((item: any) => ({
    time: item.mealType,
    name: item.menu.name,
    calories: item.menu.calories,
    protein: item.menu.protein,
    price: item.menu.price,
    image: item.menu.image || "https://images.unsplash.com/photo-1594911772124-d1a21b15de4a?auto=format&fit=crop&q=80&w=200",
  })) || [];

  const spentToday = todayPlan?.totalPrice || 0;
  const progressPercent = Math.min((spentToday / user.dailyBudget) * 100, 100);

  return (
    <div className="flex flex-col gap-8 pb-32">
      <header className="flex justify-between items-center px-4 pt-6">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Selamat Pagi,</span>
          <h1 className="text-xl font-bold text-foreground">{user.name || "Sobat Mealit"} 👋</h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary overflow-hidden shadow-inner">
          <img 
            src={user.image || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=0F5238&color=fff`} 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <section className="bg-primary rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden mx-4">
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-white/70 font-bold uppercase tracking-widest">Sisa Budget Hari Ini</span>
            <div className="text-4xl font-black">Rp {(user.dailyBudget - spentToday).toLocaleString('id-ID')}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-80">
              <span>Pengeluaran: Rp {spentToday.toLocaleString('id-ID')}</span>
              <span>Limit: Rp {user.dailyBudget.toLocaleString('id-ID')}</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-orange-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(251,146,60,0.5)]" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
      </section>

      <section className="grid grid-cols-2 gap-4 px-4">
        <StatCard 
          label="Kalori Terpakai" 
          value={(todayPlan?.totalCalories || 0).toString()} 
          subValue={`/ 2.100 kkal`} 
          icon={Flame} 
          color="warning" 
        />
        <StatCard 
          label="Protein" 
          value="65g" 
          subValue="/ 120g" 
          icon={Target} 
          color="success" 
        />
      </section>

      <section className="card-premium p-8 flex flex-col items-center text-center gap-4 border-dashed border-primary/30 bg-primary/5 rounded-[32px] mx-4">
        <div className="p-4 bg-white rounded-2xl text-primary shadow-lg">
          <Sparkles size={28} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground text-lg">Butuh Ide Makan?</h3>
          <p className="text-sm text-muted-foreground">Biarkan AI kami menyusun rencana makan bergizi sesuai sisa budgetmu.</p>
        </div>
        <Link href="/meal-planner" className="w-full mt-2">
          <Button variant="primary" size="lg" className="w-full rounded-2xl py-6 font-bold shadow-lg shadow-primary/20">Buat Meal Plan AI</Button>
        </Link>
      </section>

      <section className="flex flex-col gap-5 px-4 underline-none">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-bold text-foreground text-lg">Menu Hari Ini</h2>
          <Link href="/history" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
            Riwayat <ChevronRight size={16} />
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {todayMeals.length > 0 ? (
            todayMeals.map((meal: any, index: number) => (
              <MealPlanCard key={index} {...meal} />
            ))
          ) : (
            <div className="p-8 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
              <p className="text-sm text-muted-foreground font-medium">Belum ada menu yang direncanakan untuk hari ini.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
